import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BadgesGallery } from "@/components/badges/badges-gallery"

export default async function BadgesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("rarity", { ascending: false })

  // Fetch user's earned badges
  const { data: userBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id)

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

  return <BadgesGallery allBadges={allBadges || []} earnedBadgeIds={earnedBadgeIds} />
}
