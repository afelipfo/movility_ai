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

    // Get route history count
    const { count: routeCount } = await supabase
      .from("route_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get total time saved (sum of time_saved_minutes)
    const { data: routeHistory } = await supabase
      .from("route_history")
      .select("time_saved_minutes, co2_saved_kg")
      .eq("user_id", user.id)

    const totalTimeSaved = routeHistory?.reduce((sum, route) => sum + (route.time_saved_minutes || 0), 0) || 0
    const totalCO2Saved = routeHistory?.reduce((sum, route) => sum + (route.co2_saved_kg || 0), 0) || 0

    // Get badges count
    const { count: badgesCount } = await supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get saved routes count
    const { count: savedRoutesCount } = await supabase
      .from("saved_routes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    return NextResponse.json({
      stats: {
        totalRoutes: routeCount || 0,
        timeSavedMinutes: Math.round(totalTimeSaved),
        co2SavedKg: Math.round(totalCO2Saved * 10) / 10,
        badgesEarned: badgesCount || 0,
        savedRoutes: savedRoutesCount || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
