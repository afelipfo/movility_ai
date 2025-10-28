import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: GET /api/alerts
 * Fetch active traffic alerts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get("severity")
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build query
    let query = supabase.from("alerts").select("*").eq("is_active", true).order("created_at", { ascending: false })

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (type) {
      query = query.eq("alert_type", type)
    }

    query = query.limit(limit)

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
    console.error("[v0] Alerts API error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts", details: String(error) }, { status: 500 })
  }
}

/**
 * API Route: POST /api/alerts
 * Create a new alert (admin only or from scraping agents)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase.from("alerts").insert(body).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("[v0] Create alert API error:", error)
    return NextResponse.json({ error: "Failed to create alert", details: String(error) }, { status: 500 })
  }
}
