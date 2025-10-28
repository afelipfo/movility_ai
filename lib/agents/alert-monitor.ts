import type { AgentState, TrafficAlert } from "./types"
import { ZoneAlertService } from "../services/zone-alerts"

/**
 * Alert Monitor Agent - Monitors real-time alerts from multiple sources
 * Scrapes Twitter, Waze, Metro de Medellín, and other sources
 * Now includes critical zone monitoring
 */
export class AlertMonitorAgent {
  private zoneAlertService = new ZoneAlertService()
  async monitor(state: AgentState): Promise<AgentState> {
    console.log("[v0] Alert Monitor Agent starting...")

    try {
      // Extract route coordinates if available
      const routeCoordinates: Array<{ lat: number; lng: number }> = []
      if (state.selectedRoute?.steps) {
        for (const step of state.selectedRoute.steps) {
          if (step.startLocation) {
            routeCoordinates.push(step.startLocation)
          }
          if (step.endLocation) {
            routeCoordinates.push(step.endLocation)
          }
        }
      }

      // Add origin and destination
      if (state.origin) {
        routeCoordinates.unshift({ lat: state.origin.lat, lng: state.origin.lng })
      }
      if (state.destination) {
        routeCoordinates.push({ lat: state.destination.lat, lng: state.destination.lng })
      }

      // Fetch alerts from database with zone filtering
      const zoneAlerts = await this.zoneAlertService.getZoneAlerts({
        routeCoordinates: routeCoordinates.length > 0 ? routeCoordinates : undefined,
      })

      // Get high-priority alerts for critical zones
      const highPriorityAlerts = await this.zoneAlertService.getHighPriorityAlerts(
        routeCoordinates.length > 0 ? routeCoordinates : undefined,
      )

      // Convert zone alerts to traffic alerts format
      const alerts: TrafficAlert[] = zoneAlerts.map((zoneAlert) => ({
        id: zoneAlert.id,
        type: this.inferAlertType(zoneAlert.description),
        severity: zoneAlert.severity,
        location: {
          address: zoneAlert.zone.name,
          lat: zoneAlert.zone.coordinates.center.lat,
          lng: zoneAlert.zone.coordinates.center.lng,
        },
        description: zoneAlert.description,
        affectedRoutes: [zoneAlert.zone.name],
        source: zoneAlert.source,
        timestamp: zoneAlert.timestamp,
      }))

      // Get zone summary for context
      const zoneSummary = await this.zoneAlertService.getZoneSummary()
      const criticalZones = zoneSummary
        .filter((s) => s.criticalCount > 0)
        .map((s) => s.zone.name)
        .join(", ")

      const message = `Monitored ${alerts.length} alerts from database. ${highPriorityAlerts.length} high-priority alerts in critical zones${criticalZones ? ` (${criticalZones})` : ""}.`

      return {
        ...state,
        currentAgent: "alert_monitor",
        trafficAlerts: alerts,
        messages: [
          ...state.messages,
          {
            agent: "alert_monitor",
            content: message,
            timestamp: new Date().toISOString(),
          },
        ],
        warnings: highPriorityAlerts.length > 0 ? [...state.warnings, `${highPriorityAlerts.length} high-priority alerts affecting critical zones on your route`] : state.warnings,
      }
    } catch (error) {
      console.error("[v0] Alert monitoring error:", error)
      return {
        ...state,
        warnings: [...state.warnings, `Alert monitoring had issues: ${error}`],
      }
    }
  }

  private inferAlertType(description: string): "accident" | "construction" | "event" | "protest" | "other" {
    const lowerDesc = description.toLowerCase()
    if (lowerDesc.includes("accident") || lowerDesc.includes("choque") || lowerDesc.includes("colisión")) {
      return "accident"
    }
    if (lowerDesc.includes("obra") || lowerDesc.includes("construcción") || lowerDesc.includes("mantenimiento")) {
      return "construction"
    }
    if (lowerDesc.includes("evento") || lowerDesc.includes("partido") || lowerDesc.includes("concierto")) {
      return "event"
    }
    if (lowerDesc.includes("protest") || lowerDesc.includes("manifestación") || lowerDesc.includes("bloqueo")) {
      return "protest"
    }
    return "other"
  }
}
