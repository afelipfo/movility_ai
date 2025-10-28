import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile and stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  // Fetch recent route history
  const { data: recentRoutes } = await supabase
    .from("route_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return <AnalyticsDashboard profile={profile} userBadges={userBadges || []} recentRoutes={recentRoutes || []} />
}
