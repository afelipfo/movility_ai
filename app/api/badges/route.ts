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

    // Get all badges with user's earned status
    const { data: allBadges, error: badgesError } = await supabase
      .from("badges")
      .select("*")
      .order("rarity", { ascending: true })

    if (badgesError) {
      return NextResponse.json({ error: badgesError.message }, { status: 500 })
    }

    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id)

    if (userBadgesError) {
      return NextResponse.json({ error: userBadgesError.message }, { status: 500 })
    }

    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

    const badgesWithStatus = allBadges?.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: userBadges?.find((ub) => ub.badge_id === badge.id)?.earned_at,
    }))

    return NextResponse.json({ badges: badgesWithStatus })
  } catch (error) {
    console.error("[v0] Error fetching badges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
