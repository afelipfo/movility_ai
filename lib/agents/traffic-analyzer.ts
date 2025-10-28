import type { AgentState, TrafficPrediction, CongestionZone, Location } from "./types"
import { GoogleMapsService } from "../services/google-maps"
import { TrafficMLService, type TrafficFeatures } from "../services/traffic-ml"
import {
  CRITICAL_ZONES,
  findCriticalZone,
  getZonesInPeakHours,
  distanceToZone,
  type CriticalZone as MedellinZone,
} from "../config/medellin-zones"

/**
 * Traffic Analyzer Agent - Analyzes real-time traffic conditions
 * NOW USES REAL Google Maps API + Critical Zones Monitoring
 */
export class TrafficAnalyzerAgent {
  private googleMaps: GoogleMapsService
  private mlService: TrafficMLService

  constructor() {
    this.googleMaps = new GoogleMapsService()
    this.mlService = new TrafficMLService()
  }

  async analyze(state: AgentState): Promise<AgentState> {
    console.log("[TrafficAnalyzer] Starting traffic analysis...")

    try {
      // Get current traffic conditions
      const congestionZones = await this.identifyCongestionZones(state.origin, state.destination)

      // Get traffic predictions for the route
      const predictions = await this.getPredictions(congestionZones, state.departureTime)

      // Get REAL traffic data from Google Maps
      let realTimeTraffic: "low" | "medium" | "high" | "severe" = "low"
      if (state.origin && state.destination) {
        realTimeTraffic = await this.googleMaps.getTrafficConditions(
          { lat: state.origin.lat, lng: state.origin.lng },
          { lat: state.destination.lat, lng: state.destination.lng },
        )
        console.log(`[TrafficAnalyzer] Real-time traffic level: ${realTimeTraffic}`)
      }

      // Analyze impact on potential routes
      const trafficImpact = this.analyzeTrafficImpact(congestionZones, predictions, realTimeTraffic)

      return {
        ...state,
        currentAgent: "traffic_analyzer",
        congestionZones,
        trafficPredictions: predictions,
        messages: [
          ...state.messages,
          {
            agent: "traffic_analyzer",
            content: `Analyzed traffic: ${congestionZones.length} zones, ${predictions.length} predictions. Real-time: ${realTimeTraffic}. Impact: ${trafficImpact}`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    } catch (error) {
      console.error("[TrafficAnalyzer] Traffic analysis error:", error)
      return {
        ...state,
        errors: [...state.errors, `Traffic analysis failed: ${error}`],
      }
    }
  }

  private async identifyCongestionZones(origin?: Location, destination?: Location): Promise<CongestionZone[]> {
    console.log("[TrafficAnalyzer] Identifying congestion zones in Medellín...")

    const zones: CongestionZone[] = []

    // Get zones currently in peak hours
    const zonesInPeak = getZonesInPeakHours()
    console.log(`[TrafficAnalyzer] ${zonesInPeak.length} critical zones currently in peak hours`)

    // Convert Medellin critical zones to CongestionZone format
    for (const criticalZone of CRITICAL_ZONES) {
      // Determine current level based on peak hours and priority
      let currentLevel: "low" | "medium" | "high" | "severe" = "low"

      const isInPeakHour = zonesInPeak.some((z) => z.id === criticalZone.id)

      if (isInPeakHour) {
        // During peak hours, level depends on priority
        if (criticalZone.priority === "critical") currentLevel = "severe"
        else if (criticalZone.priority === "high") currentLevel = "high"
        else currentLevel = "medium"
      } else {
        // Outside peak hours
        if (criticalZone.priority === "critical") currentLevel = "medium"
        else currentLevel = "low"
      }

      // Check if zone is relevant to the route
      let isRelevant = true
      if (origin && destination) {
        const distToOrigin = distanceToZone(origin.lat, origin.lng, criticalZone)
        const distToDest = distanceToZone(destination.lat, destination.lng, criticalZone)

        // Only include zone if it's within 5km of origin or destination
        isRelevant = distToOrigin < 5 || distToDest < 5
      }

      if (isRelevant) {
        zones.push({
          name: criticalZone.name,
          location: {
            address: criticalZone.description,
            lat: criticalZone.coordinates.center.lat,
            lng: criticalZone.coordinates.center.lng,
          },
          radius: this.calculateZoneRadius(criticalZone),
          currentLevel,
          peakHours: criticalZone.peakHours,
        })
      }
    }

    // If we have origin/destination, check for real-time traffic using Google Maps
    if (origin && destination) {
      for (const zone of zones) {
        try {
          const trafficLevel = await this.googleMaps.getTrafficConditions(
            { lat: origin.lat, lng: origin.lng },
            { lat: zone.location.lat, lng: zone.location.lng },
          )

          // Update zone level based on real-time data
          if (trafficLevel === "severe") zone.currentLevel = "severe"
          else if (trafficLevel === "high" && zone.currentLevel !== "severe") zone.currentLevel = "high"
        } catch (error) {
          console.error(`[TrafficAnalyzer] Error checking traffic for ${zone.name}:`, error)
        }
      }
    }

    console.log(`[TrafficAnalyzer] Identified ${zones.length} congestion zones`)
    return zones
  }

  /**
   * Calculate zone radius based on bounds
   */
  private calculateZoneRadius(zone: MedellinZone): number {
    const { bounds } = zone.coordinates
    const latDiff = bounds.north - bounds.south
    const lngDiff = bounds.east - bounds.west
    return Math.max(latDiff, lngDiff) * 111 // Convert to km (rough approximation)
  }

  private async getPredictions(zones: CongestionZone[], departureTime?: string): Promise<TrafficPrediction[]> {
    const baseTime = departureTime ? new Date(departureTime) : new Date()

    const features: TrafficFeatures = {
      dayOfWeek: baseTime.getDay(),
      hourOfDay: baseTime.getHours(),
      isHoliday: this.isHoliday(baseTime),
      weatherCondition: this.estimateWeather(),
    }

    const targetZones = zones.length > 0 ? zones.slice(0, Math.min(4, zones.length)) : this.defaultZones()
    const zoneNames = targetZones.map((zone) => zone.name)

    const forecasts = await this.mlService.predictMultipleZones(zoneNames, features, {
      baseTime,
      horizons: [30, 60],
      intervalMinutes: 15,
    })

    return forecasts.map((forecast) => {
      const matchedZone =
        targetZones.find((zone) => zone.name === forecast.zone) ??
        targetZones[targetZones.length - 1] ??
        this.defaultZones()[0]

      return {
        zone: forecast.zone,
        location: matchedZone.location,
        predictedLevel: forecast.predictedLevel,
        confidence: forecast.confidence,
        timeWindow: this.formatTimeWindow(forecast.horizonMinutes, forecast.timestamp),
        factors: forecast.factors,
      }
    })
  }

  private analyzeTrafficImpact(
    zones: CongestionZone[],
    predictions: TrafficPrediction[],
    realTimeTraffic: "low" | "medium" | "high" | "severe",
  ): string {
    const highCongestionZones = zones.filter((z) => z.currentLevel === "high" || z.currentLevel === "severe")
    const highPredictions = predictions.filter((p) => p.predictedLevel === "high" || p.predictedLevel === "severe")

    // Factor in real-time traffic from Google Maps
    if (realTimeTraffic === "severe" || highCongestionZones.length > 2 || highPredictions.length > 3) {
      return "High traffic impact expected"
    } else if (
      realTimeTraffic === "high" ||
      realTimeTraffic === "medium" ||
      highCongestionZones.length > 0 ||
      highPredictions.length > 0
    ) {
      return "Moderate traffic impact expected"
    }

    return "Low traffic impact expected"
  }

  private isHoliday(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  private estimateWeather(): "sunny" | "rainy" | "cloudy" {
    // Placeholder: in production fetch from weather service
    return "sunny"
  }

  private formatTimeWindow(horizonMinutes: number, isoTimestamp: string): string {
    const time = new Date(isoTimestamp)
    const formattedTime = time.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    return `Próximos ${horizonMinutes} min (${formattedTime})`
  }

  private defaultZones(): CongestionZone[] {
    return [
      {
        name: "Medellín Centro",
        location: { address: "Medellín, Antioquia", lat: 6.2442, lng: -75.5812 },
        radius: 3,
        currentLevel: "medium",
        peakHours: ["06:00-09:00", "16:00-19:00"],
      },
    ]
  }
}
