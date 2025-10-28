import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from("route_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error("[v0] Error fetching route history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      origin,
      destination,
      route_data,
      transport_mode,
      duration_minutes,
      distance_km,
      time_saved_minutes,
      co2_saved_kg,
    } = body

    const { data: historyEntry, error } = await supabase
      .from("route_history")
      .insert({
        user_id: user.id,
        origin,
        destination,
        route_data,
        transport_mode,
        duration_minutes,
        distance_km,
        time_saved_minutes,
        co2_saved_kg,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check for new badges after adding route
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/badges/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return NextResponse.json({ historyEntry })
  } catch (error) {
    console.error("[v0] Error adding route to history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
