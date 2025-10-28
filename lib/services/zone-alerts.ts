/**
 * Zone-based Alert System
 * Filters and prioritizes alerts based on critical zones
 */

import { createClient } from "@/lib/supabase/server"
import { CRITICAL_ZONES, findCriticalZone, getZonesInPeakHours, type CriticalZone } from "../config/medellin-zones"

export interface ZoneAlert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  zone: CriticalZone
  source: string
  timestamp: string
  isPeakHour: boolean
  affectsRoute?: boolean
}

export interface ZoneAlertFilters {
  zoneIds?: string[]
  severityMin?: "low" | "medium" | "high" | "critical"
  onlyPeakHours?: boolean
  onlyAffectingRoute?: boolean
  routeCoordinates?: Array<{ lat: number; lng: number }>
}

export class ZoneAlertService {
  /**
   * Get all active alerts for critical zones
   */
  async getZoneAlerts(filters?: ZoneAlertFilters): Promise<ZoneAlert[]> {
    try {
      const supabase = await createClient()

      // Fetch all active alerts from database
      let query = supabase
        .from("alerts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      const { data: alerts, error } = await query

      if (error) {
        console.error("[v0] Error fetching zone alerts:", error)
        return []
      }

      if (!alerts) return []

      // Enrich alerts with zone information
      const zoneAlerts: ZoneAlert[] = []
      const zonesInPeak = getZonesInPeakHours()

      for (const alert of alerts) {
        // Try to detect zone from metadata first
        let zone: CriticalZone | null = null

        if (alert.metadata?.criticalZone?.id) {
          zone = CRITICAL_ZONES.find((z) => z.id === alert.metadata.criticalZone.id) || null
        }

        // If no zone in metadata, try to detect from coordinates
        if (!zone && alert.location_lat && alert.location_lng) {
          zone = findCriticalZone(alert.location_lat, alert.location_lng)
        }

        // Skip if no zone detected
        if (!zone) continue

        const isPeakHour = zonesInPeak.some((z) => z.id === zone!.id)

        // Check if alert affects route (if route coordinates provided)
        let affectsRoute = false
        if (filters?.routeCoordinates && filters.routeCoordinates.length > 0) {
          affectsRoute = this.checkRouteIntersection(filters.routeCoordinates, zone)
        }

        zoneAlerts.push({
          id: alert.id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          zone,
          source: alert.source,
          timestamp: alert.created_at,
          isPeakHour,
          affectsRoute,
        })
      }

      // Apply filters
      let filteredAlerts = zoneAlerts

      if (filters?.zoneIds && filters.zoneIds.length > 0) {
        filteredAlerts = filteredAlerts.filter((alert) => filters.zoneIds!.includes(alert.zone.id))
      }

      if (filters?.severityMin) {
        const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
        const minLevel = severityOrder[filters.severityMin]
        filteredAlerts = filteredAlerts.filter((alert) => severityOrder[alert.severity] >= minLevel)
      }

      if (filters?.onlyPeakHours) {
        filteredAlerts = filteredAlerts.filter((alert) => alert.isPeakHour)
      }

      if (filters?.onlyAffectingRoute) {
        filteredAlerts = filteredAlerts.filter((alert) => alert.affectsRoute)
      }

      // Sort by priority: critical zones + high severity first
      filteredAlerts.sort((a, b) => {
        // First, sort by zone priority
        const priorityOrder = { critical: 3, high: 2, medium: 1 }
        const priorityDiff = priorityOrder[b.zone.priority] - priorityOrder[a.zone.priority]
        if (priorityDiff !== 0) return priorityDiff

        // Then by alert severity
        const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
        if (severityDiff !== 0) return severityDiff

        // Finally by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      return filteredAlerts
    } catch (error) {
      console.error("[v0] Zone alert service error:", error)
      return []
    }
  }

  /**
   * Get summary of alerts by zone
   */
  async getZoneSummary(): Promise<
    Array<{
      zone: CriticalZone
      alertCount: number
      criticalCount: number
      isPeakHour: boolean
    }>
  > {
    const alerts = await this.getZoneAlerts()
    const zonesInPeak = getZonesInPeakHours()

    const summary = new Map<
      string,
      { zone: CriticalZone; alertCount: number; criticalCount: number; isPeakHour: boolean }
    >()

    for (const alert of alerts) {
      if (!summary.has(alert.zone.id)) {
        summary.set(alert.zone.id, {
          zone: alert.zone,
          alertCount: 0,
          criticalCount: 0,
          isPeakHour: zonesInPeak.some((z) => z.id === alert.zone.id),
        })
      }

      const entry = summary.get(alert.zone.id)!
      entry.alertCount++
      if (alert.severity === "critical" || alert.severity === "high") {
        entry.criticalCount++
      }
    }

    return Array.from(summary.values()).sort((a, b) => {
      // Sort by critical count first
      const criticalDiff = b.criticalCount - a.criticalCount
      if (criticalDiff !== 0) return criticalDiff

      // Then by total alert count
      return b.alertCount - a.alertCount
    })
  }

  /**
   * Get high-priority alerts for user notifications
   */
  async getHighPriorityAlerts(routeCoordinates?: Array<{ lat: number; lng: number }>): Promise<ZoneAlert[]> {
    const alerts = await this.getZoneAlerts({
      severityMin: "high",
      routeCoordinates,
    })

    // Filter for critical zones or alerts affecting route
    return alerts.filter((alert) => alert.zone.priority === "critical" || alert.affectsRoute)
  }

  /**
   * Check if route intersects with a critical zone
   */
  private checkRouteIntersection(routePoints: Array<{ lat: number; lng: number }>, zone: CriticalZone): boolean {
    // Check if any route point falls within the zone bounds
    for (const point of routePoints) {
      const { bounds } = zone.coordinates
      if (
        point.lat >= bounds.south &&
        point.lat <= bounds.north &&
        point.lng >= bounds.west &&
        point.lng <= bounds.east
      ) {
        return true
      }
    }

    // Also check if route passes near zone center (within 1km)
    const zoneCenter = zone.coordinates.center
    for (const point of routePoints) {
      const distance = this.calculateDistance(point.lat, point.lng, zoneCenter.lat, zoneCenter.lng)
      if (distance <= 1.0) {
        // Within 1km
        return true
      }
    }

    return false
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}
