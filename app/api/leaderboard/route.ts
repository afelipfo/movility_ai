import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "node:crypto"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id,total_distance_km,total_routes_planned")
      .gt("total_routes_planned", 0)
      .order("total_distance_km", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    const leaderboard = (profiles ?? []).map((profile, index) => {
      const hash = crypto.createHash("sha256").update(profile.id ?? `anon-${index}`).digest("hex")
      const alias = `Usuario ${hash.slice(0, 6).toUpperCase()}`
      return {
        rank: index + 1,
        alias,
        totalDistanceKm: Number(profile.total_distance_km ?? 0),
        totalRoutes: Number(profile.total_routes_planned ?? 0),
      }
    })

    return NextResponse.json({ success: true, leaderboard })
  } catch (error) {
    console.error("[Leaderboard] API error:", error)
    return NextResponse.json({ success: false, error: "No se pudo generar el ranking" }, { status: 500 })
  }
}
