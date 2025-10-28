/**
 * Waze Data Scraper
 * Monitors Waze for real-time traffic incidents
 */

import { findCriticalZoneByText, findCriticalZone, type CriticalZone } from "../config/medellin-zones"

export interface WazeIncident {
  id: string
  type: "accident" | "jam" | "roadClosed" | "hazard" | "construction"
  subtype?: string
  location: {
    lat: number
    lng: number
    street?: string
  }
  description: string
  severity: number // 1-5
  reportedBy: number // Number of reports
  timestamp: string
  criticalZone?: CriticalZone // Detected critical zone
}

export class WazeScraperService {
  /**
   * Fetch incidents from Waze API
   */
  async scrapeIncidents(bounds: { north: number; south: number; east: number; west: number }): Promise<WazeIncident[]> {
    try {
      console.log("[v0] Scraping Waze for incidents...")

      // In production, use Waze API or scrape Waze Live Map
      // For now, return mock data
      const mockIncidents: WazeIncident[] = [
        {
          id: "waze-1",
          type: "accident",
          location: {
            lat: 6.1701,
            lng: -75.5906,
            street: "Autopista Sur",
          },
          description: "Accidente reportado por 15 usuarios en Autopista Sur",
          severity: 4,
          reportedBy: 15,
          timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        },
        {
          id: "waze-2",
          type: "jam",
          location: {
            lat: 6.2563,
            lng: -75.5908,
            street: "Carrera 70",
          },
          description: "Tráfico pesado cerca del Estadio en Carrera 70",
          severity: 3,
          reportedBy: 8,
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        },
        {
          id: "waze-3",
          type: "construction",
          location: {
            lat: 6.2442,
            lng: -75.5812,
            street: "Avenida Oriental",
          },
          description: "Obras en la vía sobre Avenida Oriental",
          severity: 2,
          reportedBy: 5,
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
          id: "waze-4",
          type: "jam",
          location: {
            lat: 6.2704,
            lng: -75.5664,
            street: "Autopista Norte",
          },
          description: "Congestión vehicular en Autopista Norte hacia Bello",
          severity: 4,
          reportedBy: 22,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: "waze-5",
          type: "accident",
          location: {
            lat: 6.2088,
            lng: -75.5736,
            street: "Calle 33",
          },
          description: "Choque múltiple en Calle 33 con Carrera 43A",
          severity: 5,
          reportedBy: 35,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        },
      ]

      // Detect critical zones for each incident
      const enrichedIncidents = mockIncidents.map((incident) => {
        // Try to detect zone by text first (street name + description)
        let zone = findCriticalZoneByText(`${incident.location.street || ""} ${incident.description}`)

        // If not found by text, try by coordinates
        if (!zone) {
          zone = findCriticalZone(incident.location.lat, incident.location.lng)
        }

        return {
          ...incident,
          criticalZone: zone || undefined,
        }
      })

      return enrichedIncidents
    } catch (error) {
      console.error("[v0] Waze scraping error:", error)
      return []
    }
  }

  /**
   * Convert Waze severity to our severity scale
   */
  convertSeverity(wazeSeverity: number): "low" | "medium" | "high" | "critical" {
    if (wazeSeverity >= 4) return "critical"
    if (wazeSeverity === 3) return "high"
    if (wazeSeverity === 2) return "medium"
    return "low"
  }
}
