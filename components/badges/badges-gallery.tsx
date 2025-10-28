"use client"

import { Header } from "@/components/dashboard/header"
import { Lock, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Badge as BadgeType } from "@/lib/types/database"

interface BadgesGalleryProps {
  allBadges: BadgeType[]
  earnedBadgeIds: Set<string>
}

export function BadgesGallery({ allBadges, earnedBadgeIds }: BadgesGalleryProps) {
  const categories = ["routes", "eco", "explorer", "special"]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "epic":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      case "rare":
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
    }
  }

  const getIconForBadge = (iconName: string): string => {
    const icons: Record<string, string> = {
      route: "🗺️",
      map: "🧭",
      compass: "🧭",
      "map-pin": "📍",
      leaf: "🌿",
      tree: "🌳",
      globe: "🌍",
      clock: "⏰",
      zap: "⚡",
      timer: "⏱️",
      footprints: "👣",
      bike: "🚴",
      train: "🚇",
      star: "⭐",
      "train-front": "🚊",
      bus: "🚌",
    }
    return icons[iconName] || "🏆"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Galería de Logros</h1>
              <p className="text-muted-foreground">Colecciona badges usando MovilityAI</p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-4" />
              <span className="text-lg font-semibold">
                {earnedBadgeIds.size} / {allBadges.length}
              </span>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.has(badge.id)}
                    getRarityColor={getRarityColor}
                    getIcon={getIconForBadge}
                  />
                ))}
              </div>
            </TabsContent>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {allBadges
                    .filter((b) => b.category === cat)
                    .map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isEarned={earnedBadgeIds.has(badge.id)}
                        getRarityColor={getRarityColor}
                        getIcon={getIconForBadge}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function BadgeCard({
  badge,
  isEarned,
  getRarityColor,
  getIcon,
}: {
  badge: BadgeType
  isEarned: boolean
  getRarityColor: (rarity: string) => string
  getIcon: (iconName: string) => string
}) {
  return (
    <Card className={`group relative overflow-hidden transition-all hover:shadow-lg ${!isEarned && "opacity-50"}`}>
      <div className={`absolute inset-0 opacity-10 ${getRarityColor(badge.rarity)}`} />
      <CardContent className="relative p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-4xl">{isEarned ? getIcon(badge.icon_name) : <Lock className="h-10 w-10" />}</div>
            <Badge variant="outline" className="text-xs capitalize">
              {badge.rarity}
            </Badge>
          </div>
          <div>
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">+{badge.experience_points} XP</span>
            {!isEarned && <span className="text-muted-foreground">Bloqueado</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
