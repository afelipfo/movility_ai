import { NextRequest, NextResponse } from "next/server"
import { ZoneAlertService } from "@/lib/services/zone-alerts"
import { createServerClient } from "@/lib/supabase/server"

/**
 * GET /api/alerts/zones
 * Get alerts filtered by critical zones
 *
 * Query parameters:
 * - zoneIds: Comma-separated zone IDs (optional)
 * - severityMin: Minimum severity level (optional)
 * - onlyPeakHours: Filter for peak hours only (optional)
 * - summary: Get zone summary instead of alerts (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow unauthenticated access for public alerts
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const searchParams = request.nextUrl.searchParams
    const zoneIdsParam = searchParams.get("zoneIds")
    const severityMin = searchParams.get("severityMin") as "low" | "medium" | "high" | "critical" | null
    const onlyPeakHours = searchParams.get("onlyPeakHours") === "true"
    const summary = searchParams.get("summary") === "true"

    const zoneAlertService = new ZoneAlertService()

    // If summary requested, return zone summary
    if (summary) {
      const zoneSummary = await zoneAlertService.getZoneSummary()
      return NextResponse.json({ data: zoneSummary })
    }

    // Parse filters
    const filters = {
      zoneIds: zoneIdsParam ? zoneIdsParam.split(",") : undefined,
      severityMin: severityMin || undefined,
      onlyPeakHours: onlyPeakHours || undefined,
    }

    // Get zone alerts
    const alerts = await zoneAlertService.getZoneAlerts(filters)

    return NextResponse.json({
      data: alerts,
      count: alerts.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching zone alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch zone alerts" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts/zones/high-priority
 * Get high-priority alerts for a specific route
 *
 * Body:
 * - routeCoordinates: Array of {lat, lng} coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow unauthenticated access
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { routeCoordinates } = body

    if (!routeCoordinates || !Array.isArray(routeCoordinates)) {
      return NextResponse.json(
        { error: "routeCoordinates array is required" },
        { status: 400 }
      )
    }

    const zoneAlertService = new ZoneAlertService()
    const highPriorityAlerts = await zoneAlertService.getHighPriorityAlerts(routeCoordinates)

    return NextResponse.json({
      data: highPriorityAlerts,
      count: highPriorityAlerts.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching high-priority alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch high-priority alerts" },
      { status: 500 }
    )
  }
}
