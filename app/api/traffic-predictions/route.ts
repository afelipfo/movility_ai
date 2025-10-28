import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: GET /api/traffic-predictions
 * Fetch traffic predictions for a specific zone and time
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const zone = searchParams.get("zone")
    const timeWindow = searchParams.get("timeWindow") || new Date().toISOString()

    let query = supabase
      .from("traffic_predictions")
      .select("*")
      .gte("prediction_for_time", timeWindow)
      .order("prediction_for_time", { ascending: true })
      .limit(10)

    if (zone) {
      query = query.eq("zone_name", zone)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    })
  } catch (error) {
    console.error("[v0] Traffic predictions API error:", error)
    return NextResponse.json({ error: "Failed to fetch predictions", details: String(error) }, { status: 500 })
  }
}
