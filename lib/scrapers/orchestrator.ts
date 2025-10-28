/**
 * Scraping Orchestrator
 * Coordinates all scrapers and saves data to database
 */

import { TwitterScraperService } from "./twitter-scraper"
import { WazeScraperService } from "./waze-scraper"
import { MetroScraperService } from "./metro-scraper"
import { EventsScraperService } from "./events-scraper"
import { createClient } from "@/lib/supabase/server"

export class ScrapingOrchestrator {
  private twitterScraper = new TwitterScraperService()
  private wazeScraper = new WazeScraperService()
  private metroScraper = new MetroScraperService()
  private eventsScraper = new EventsScraperService()

  /**
   * Run all scrapers and save results to database
   */
  async runAll(): Promise<{
    alerts: number
    events: number
    errors: string[]
  }> {
    const errors: string[] = []
    let alertsCount = 0
    let eventsCount = 0

    try {
      // Run scrapers in parallel
      const [twitterAlerts, wazeIncidents, metroUpdates, upcomingEvents] = await Promise.all([
        this.twitterScraper.scrapeTrafficAlerts().catch((e) => {
          errors.push(`Twitter: ${e}`)
          return []
        }),
        this.wazeScraper
          .scrapeIncidents({
            north: 6.4,
            south: 6.1,
            east: -75.5,
            west: -75.7,
          })
          .catch((e) => {
            errors.push(`Waze: ${e}`)
            return []
          }),
        this.metroScraper.scrapeServiceUpdates().catch((e) => {
          errors.push(`Metro: ${e}`)
          return []
        }),
        this.eventsScraper.scrapeUpcomingEvents().catch((e) => {
          errors.push(`Events: ${e}`)
          return []
        }),
      ])

      // Save to database
      const supabase = await createClient()

      // Save Twitter alerts
      for (const tweet of twitterAlerts) {
        const parsed = this.twitterScraper.parseAlert(tweet)
        const { error } = await supabase.from("alerts").insert({
          title: `Alerta de ${tweet.author}`,
          description: parsed.description,
          alert_type: parsed.type,
          severity: parsed.severity,
          location_address: tweet.location || tweet.criticalZone?.name || "Medellín",
          location_lat: tweet.lat || tweet.criticalZone?.coordinates.center.lat,
          location_lng: tweet.lng || tweet.criticalZone?.coordinates.center.lng,
          source: "twitter",
          source_url: `https://twitter.com/${tweet.author}/status/${tweet.id}`,
          is_active: true,
          metadata: tweet.criticalZone
            ? {
                criticalZone: {
                  id: tweet.criticalZone.id,
                  name: tweet.criticalZone.name,
                  priority: tweet.criticalZone.priority,
                },
              }
            : undefined,
        })

        if (!error) alertsCount++
      }

      // Save Waze incidents
      for (const incident of wazeIncidents) {
        const { error } = await supabase.from("alerts").insert({
          title: `${incident.type} reportado en Waze`,
          description: incident.description,
          alert_type: incident.type === "jam" ? "construction" : incident.type,
          severity: this.wazeScraper.convertSeverity(incident.severity),
          location_address: incident.location.street || incident.criticalZone?.name || "Medellín",
          location_lat: incident.location.lat,
          location_lng: incident.location.lng,
          source: "waze",
          is_active: true,
          metadata: incident.criticalZone
            ? {
                criticalZone: {
                  id: incident.criticalZone.id,
                  name: incident.criticalZone.name,
                  priority: incident.criticalZone.priority,
                },
              }
            : undefined,
        })

        if (!error) alertsCount++
      }

      // Save Metro updates (only if there are issues)
      for (const update of metroUpdates) {
        if (update.type !== "normal") {
          const { error } = await supabase.from("alerts").insert({
            title: `Metro Línea ${update.line}: ${update.type}`,
            description: update.message,
            alert_type: "construction",
            severity: update.severity,
            location_address: update.criticalZone?.name || `Línea ${update.line}`,
            location_lat: update.criticalZone?.coordinates.center.lat,
            location_lng: update.criticalZone?.coordinates.center.lng,
            source: "metro",
            is_active: true,
            metadata: update.criticalZone
              ? {
                  criticalZone: {
                    id: update.criticalZone.id,
                    name: update.criticalZone.name,
                    priority: update.criticalZone.priority,
                  },
                  metroLine: update.line,
                  affectedStations: update.affectedStations,
                }
              : {
                  metroLine: update.line,
                  affectedStations: update.affectedStations,
                },
          })

          if (!error) alertsCount++
        }
      }

      // Save events
      for (const event of upcomingEvents) {
        // Calculate traffic impact based on attendance and critical zone
        let trafficImpact: "low" | "medium" | "high" = "medium"
        if (event.criticalZone?.priority === "critical") {
          trafficImpact = "high"
        } else if (event.expectedAttendance && event.expectedAttendance > 10000) {
          trafficImpact = "high"
        } else if (event.expectedAttendance && event.expectedAttendance < 5000) {
          trafficImpact = "low"
        }

        const { error } = await supabase.from("events").insert({
          title: event.title,
          event_type: "concert", // Simplified
          venue_name: event.venue,
          venue_address: event.address,
          start_time: event.startTime,
          end_time: event.endTime,
          expected_attendance: event.expectedAttendance,
          traffic_impact_level: trafficImpact,
          source: "scraped",
          source_url: event.url,
          is_active: true,
          metadata: event.criticalZone
            ? {
                criticalZone: {
                  id: event.criticalZone.id,
                  name: event.criticalZone.name,
                  priority: event.criticalZone.priority,
                },
              }
            : undefined,
        })

        if (!error) eventsCount++
      }

      console.log(`[v0] Scraping complete: ${alertsCount} alerts, ${eventsCount} events`)

      return {
        alerts: alertsCount,
        events: eventsCount,
        errors,
      }
    } catch (error) {
      console.error("[v0] Scraping orchestrator error:", error)
      errors.push(`Orchestrator: ${error}`)
      return { alerts: alertsCount, events: eventsCount, errors }
    }
  }
}

export { ScrapingOrchestrator as ScraperOrchestrator }
