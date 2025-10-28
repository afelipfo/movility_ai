import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RouteHistoryList } from "@/components/history/route-history-list"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch route history
  const { data: routeHistory } = await supabase
    .from("route_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch saved routes
  const { data: savedRoutes } = await supabase
    .from("saved_routes")
    .select("*")
    .eq("user_id", user.id)
    .order("use_count", { ascending: false })

  return <RouteHistoryList routeHistory={routeHistory || []} savedRoutes={savedRoutes || []} />
}
