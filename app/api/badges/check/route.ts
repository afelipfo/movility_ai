import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Check and award badges based on user activity
export async function POST() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user stats
    const { count: routeCount } = await supabase
      .from("route_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    const { data: routeHistory } = await supabase
      .from("route_history")
      .select("time_saved_minutes, co2_saved_kg")
      .eq("user_id", user.id)

    const totalTimeSaved = routeHistory?.reduce((sum, route) => sum + (route.time_saved_minutes || 0), 0) || 0
    const totalCO2Saved = routeHistory?.reduce((sum, route) => sum + (route.co2_saved_kg || 0), 0) || 0

    // Get existing user badges
    const { data: existingBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id)

    const earnedBadgeIds = new Set(existingBadges?.map((b) => b.badge_id) || [])

    // Badge criteria
    const badgeCriteria = [
      { name: "Primera Ruta", condition: routeCount && routeCount >= 1 },
      { name: "Explorador Urbano", condition: routeCount && routeCount >= 10 },
      { name: "Maestro de Rutas", condition: routeCount && routeCount >= 50 },
      { name: "Eco Guerrero", condition: totalCO2Saved >= 10 },
      { name: "Guardián del Planeta", condition: totalCO2Saved >= 100 },
      { name: "Ahorrador de Tiempo", condition: totalTimeSaved >= 60 },
      { name: "Optimizador Experto", condition: totalTimeSaved >= 500 },
    ]

    const newBadges = []

    for (const criteria of badgeCriteria) {
      if (criteria.condition) {
        // Get badge from database
        const { data: badge } = await supabase.from("badges").select("id").eq("name", criteria.name).single()

        if (badge && !earnedBadgeIds.has(badge.id)) {
          // Award badge
          const { error: insertError } = await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_id: badge.id,
          })

          if (!insertError) {
            newBadges.push(criteria.name)
          }
        }
      }
    }

    return NextResponse.json({
      newBadges,
      message:
        newBadges.length > 0
          ? `¡Felicidades! Has ganado ${newBadges.length} nuevo(s) badge(s)`
          : "No hay nuevos badges",
    })
  } catch (error) {
    console.error("[v0] Error checking badges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
