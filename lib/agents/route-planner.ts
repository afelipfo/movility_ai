import type { AgentState, RouteOption, Location, RouteStep } from "./types"
import { calculateDistance, estimateCO2Emissions } from "../utils/calculations"
import { GoogleMapsService } from "../services/google-maps"

/**
 * Route Planner Agent - Plans optimal routes using multiple transport modes
 * NOW USES REAL Google Maps API Integration
 */
export class RoutePlannerAgent {
  private googleMaps: GoogleMapsService

  constructor() {
    this.googleMaps = new GoogleMapsService()
  }

  async plan(state: AgentState): Promise<AgentState> {
    console.log("[RoutePlanner] Starting route planning...")

    try {
      if (!state.origin || !state.destination) {
        return {
          ...state,
          errors: [...state.errors, "Missing origin or destination"],
        }
      }

      // Generate multiple route options with different transport modes
      const routes = await this.generateRouteOptions(
        state.origin,
        state.destination,
        state.preferredModes || ["transit", "walking", "bicycling"],
        state.trafficAlerts,
      )

      // Rank routes by efficiency
      const rankedRoutes = this.rankRoutes(routes, state)

      console.log(`[RoutePlanner] Generated ${routes.length} routes, ranked successfully`)

      return {
        ...state,
        currentAgent: "route_planner",
        routeOptions: rankedRoutes.slice(0, 5), // Top 5 routes
        alternativeRoutes: rankedRoutes.slice(5, 10), // Next 5 as alternatives
        selectedRoute: rankedRoutes[0], // Best route
        messages: [
          ...state.messages,
          {
            agent: "route_planner",
            content: `Generated ${routes.length} route options. Best route: ${rankedRoutes[0]?.duration} min, ${rankedRoutes[0]?.distance.toFixed(2)} km`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    } catch (error) {
      console.error("[RoutePlanner] Route planning error:", error)
      return {
        ...state,
        errors: [...state.errors, `Route planning failed: ${error}`],
      }
    }
  }

  private async generateRouteOptions(
    origin: Location,
    destination: Location,
    preferredModes: string[],
    alerts: any[],
  ): Promise<RouteOption[]> {
    const routes: RouteOption[] = []
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng)

    console.log(`[RoutePlanner] Distance: ${distance.toFixed(2)}km, Modes: ${preferredModes.join(", ")}`)

    // Strategy 1: Transit (Metro + Bus) - Use real Google Maps Transit API
    if (preferredModes.includes("transit") || preferredModes.includes("metro") || preferredModes.includes("bus")) {
      const transitRoute = await this.generateTransitRoute(origin, destination)
      if (transitRoute) routes.push(transitRoute)
    }

    // Strategy 2: Walking (for short distances) - Use real Google Maps Walking API
    if (distance < 3 && (preferredModes.includes("walking") || preferredModes.includes("walk"))) {
      const walkRoute = await this.generateWalkingRoute(origin, destination)
      if (walkRoute) routes.push(walkRoute)
    }

    // Strategy 3: Bicycling - Use real Google Maps Bicycling API
    if (preferredModes.includes("bicycling") || preferredModes.includes("bike")) {
      const bikeRoute = await this.generateBikeRoute(origin, destination)
      if (bikeRoute) routes.push(bikeRoute)
    }

    // Strategy 4: Driving (for comparison) - Use real Google Maps Driving API with traffic
    if (preferredModes.includes("driving") || preferredModes.includes("car")) {
      const driveRoute = await this.generateDrivingRoute(origin, destination)
      if (driveRoute) routes.push(driveRoute)
    }

    // Filter out invalid routes and adjust for traffic alerts
    return routes.filter((r) => r.duration > 0).map((r) => this.adjustForTraffic(r, alerts))
  }

  /**
   * Generate transit route using REAL Google Maps Transit API
   */
  private async generateTransitRoute(origin: Location, destination: Location): Promise<RouteOption | null> {
    try {
      console.log("[RoutePlanner] Fetching transit route from Google Maps...")

      const googleRoute = await this.googleMaps.getDirections(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        "transit",
        new Date(),
      )

      if (!googleRoute || !googleRoute.legs || googleRoute.legs.length === 0) {
        console.warn("[RoutePlanner] No transit route found")
        return null
      }

      const leg = googleRoute.legs[0]
      const steps: RouteStep[] = leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // Remove HTML tags
        transportMode: step.travel_mode.toLowerCase() as any,
        duration: Math.ceil(step.duration.value / 60), // Convert seconds to minutes
        distance: step.distance.value / 1000, // Convert meters to km
        startLocation: {
          address: "",
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          address: "",
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
        transitDetails: step.transit_details,
      }))

      // Extract transport modes
      const modes = new Set<string>()
      steps.forEach((step) => {
        if (step.transportMode === "transit" && step.transitDetails) {
          const vehicleType = step.transitDetails.line.vehicle.type.toLowerCase()
          if (vehicleType.includes("metro") || vehicleType.includes("subway")) {
            modes.add("metro")
          } else if (vehicleType.includes("bus")) {
            modes.add("bus")
          } else {
            modes.add("transit")
          }
        } else {
          modes.add(step.transportMode)
        }
      })

      const transportModes = Array.from(modes)
      const distance = leg.distance.value / 1000 // meters to km
      const duration = Math.ceil(leg.duration.value / 60) // seconds to minutes

      return {
        id: `route-transit-${Date.now()}`,
        origin,
        destination,
        transportModes,
        duration,
        distance,
        steps,
        trafficLevel: "low",
        estimatedCost: this.calculateTransitCost(transportModes),
        co2Emissions: estimateCO2Emissions(distance, transportModes),
        confidence: 0.95,
      }
    } catch (error) {
      console.error("[RoutePlanner] Transit route error:", error)
      return null
    }
  }

  /**
   * Generate walking route using REAL Google Maps Walking API
   */
  private async generateWalkingRoute(origin: Location, destination: Location): Promise<RouteOption | null> {
    try {
      console.log("[RoutePlanner] Fetching walking route from Google Maps...")

      const googleRoute = await this.googleMaps.getDirections(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        "walking",
      )

      if (!googleRoute || !googleRoute.legs || googleRoute.legs.length === 0) {
        console.warn("[RoutePlanner] No walking route found")
        return null
      }

      const leg = googleRoute.legs[0]
      const steps: RouteStep[] = leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
        transportMode: "walk",
        duration: Math.ceil(step.duration.value / 60),
        distance: step.distance.value / 1000,
        startLocation: {
          address: "",
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          address: "",
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      }))

      const distance = leg.distance.value / 1000
      const duration = Math.ceil(leg.duration.value / 60)

      return {
        id: `route-walk-${Date.now()}`,
        origin,
        destination,
        transportModes: ["walk"],
        duration,
        distance,
        steps,
        trafficLevel: "low",
        estimatedCost: 0,
        co2Emissions: 0,
        confidence: 0.98,
      }
    } catch (error) {
      console.error("[RoutePlanner] Walking route error:", error)
      return null
    }
  }

  /**
   * Generate bicycling route using REAL Google Maps Bicycling API
   */
  private async generateBikeRoute(origin: Location, destination: Location): Promise<RouteOption | null> {
    try {
      console.log("[RoutePlanner] Fetching bicycling route from Google Maps...")

      const googleRoute = await this.googleMaps.getDirections(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        "bicycling",
      )

      if (!googleRoute || !googleRoute.legs || googleRoute.legs.length === 0) {
        console.warn("[RoutePlanner] No bicycling route found")
        return null
      }

      const leg = googleRoute.legs[0]
      const steps: RouteStep[] = leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
        transportMode: "bike",
        duration: Math.ceil(step.duration.value / 60),
        distance: step.distance.value / 1000,
        startLocation: {
          address: "",
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          address: "",
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      }))

      const distance = leg.distance.value / 1000
      const duration = Math.ceil(leg.duration.value / 60)

      return {
        id: `route-bike-${Date.now()}`,
        origin,
        destination,
        transportModes: ["bike"],
        duration,
        distance,
        steps,
        trafficLevel: "low",
        estimatedCost: 0, // EnCicla is free
        co2Emissions: 0,
        confidence: 0.9,
      }
    } catch (error) {
      console.error("[RoutePlanner] Bicycling route error:", error)
      return null
    }
  }

  /**
   * Generate driving route using REAL Google Maps Driving API with traffic
   */
  private async generateDrivingRoute(origin: Location, destination: Location): Promise<RouteOption | null> {
    try {
      console.log("[RoutePlanner] Fetching driving route from Google Maps...")

      const googleRoute = await this.googleMaps.getDirections(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        "driving",
        new Date(),
      )

      if (!googleRoute || !googleRoute.legs || googleRoute.legs.length === 0) {
        console.warn("[RoutePlanner] No driving route found")
        return null
      }

      const leg = googleRoute.legs[0]
      const steps: RouteStep[] = leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
        transportMode: "car",
        duration: Math.ceil(step.duration.value / 60),
        distance: step.distance.value / 1000,
        startLocation: {
          address: "",
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          address: "",
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      }))

      const distance = leg.distance.value / 1000
      const normalDuration = Math.ceil(leg.duration.value / 60)
      const trafficDuration = leg.duration_in_traffic
        ? Math.ceil(leg.duration_in_traffic.value / 60)
        : normalDuration

      // Determine traffic level based on delay
      const delayRatio = trafficDuration / normalDuration
      let trafficLevel: "low" | "medium" | "high" | "severe" = "low"
      if (delayRatio >= 2.0) trafficLevel = "severe"
      else if (delayRatio >= 1.5) trafficLevel = "high"
      else if (delayRatio >= 1.2) trafficLevel = "medium"

      return {
        id: `route-drive-${Date.now()}`,
        origin,
        destination,
        transportModes: ["car"],
        duration: trafficDuration,
        distance,
        steps,
        trafficLevel,
        estimatedCost: distance * 2, // Rough estimate: COP 2,000 per km (fuel + parking)
        co2Emissions: estimateCO2Emissions(distance, ["car"]),
        confidence: 0.92,
      }
    } catch (error) {
      console.error("[RoutePlanner] Driving route error:", error)
      return null
    }
  }

  /**
   * Calculate transit cost based on transport modes
   */
  private calculateTransitCost(modes: string[]): number {
    let cost = 0
    const hasMetro = modes.includes("metro")
    const hasBus = modes.includes("bus")

    if (hasMetro) cost += 2.5 // Metro fare
    if (hasBus && !hasMetro) cost += 2.5 // Bus fare (integrated with Metro)
    if (hasBus && hasMetro) cost += 0 // Integrated fare

    return cost
  }

  private adjustForTraffic(route: RouteOption, alerts: any[]): RouteOption {
    // Check if route is affected by any alerts
    let trafficMultiplier = 1.0

    alerts.forEach((alert) => {
      if (alert.severity === "high") trafficMultiplier += 0.3
      if (alert.severity === "critical") trafficMultiplier += 0.5
    })

    return {
      ...route,
      duration: Math.ceil(route.duration * trafficMultiplier),
      trafficLevel: trafficMultiplier > 1.3 ? "high" : trafficMultiplier > 1.1 ? "medium" : "low",
    }
  }

  private rankRoutes(routes: RouteOption[], state: AgentState): RouteOption[] {
    return routes.sort((a, b) => {
      // Score based on: duration (40%), cost (20%), CO2 (20%), confidence (20%)
      const scoreA =
        a.duration * 0.4 + (a.estimatedCost || 0) * 0.2 + a.co2Emissions * 0.2 + (1 - a.confidence) * 100 * 0.2

      const scoreB =
        b.duration * 0.4 + (b.estimatedCost || 0) * 0.2 + b.co2Emissions * 0.2 + (1 - b.confidence) * 100 * 0.2

      return scoreA - scoreB
    })
  }
}
