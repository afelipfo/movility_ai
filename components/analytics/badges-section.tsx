"use client"

import { Trophy, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Profile } from "@/lib/types/database"

interface BadgesSectionProps {
  userBadges: any[]
  profile: Profile | null
}

export function BadgesSection({ userBadges, profile }: BadgesSectionProps) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-chart-4" />
            Tus Logros
          </CardTitle>
          <Badge variant="secondary">{userBadges.length} desbloqueados</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userBadges.map((userBadge) => (
              <div
                key={userBadge.id}
                className="group relative overflow-hidden rounded-lg border border-border p-4 transition-all hover:shadow-lg"
              >
                <div className={`absolute inset-0 opacity-10 ${getRarityColor(userBadge.badge.rarity)}`} />
                <div className="relative space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{getIconForBadge(userBadge.badge.icon_name)}</div>
                    <Badge variant="outline" className="text-xs">
                      {userBadge.badge.rarity}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">{userBadge.badge.name}</p>
                    <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Desbloqueado: {new Date(userBadge.earned_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            ))}

            {/* Locked badges placeholder */}
            {userBadges.length < 5 && (
              <div className="group relative overflow-hidden rounded-lg border border-dashed border-border p-4 opacity-50">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Logro Bloqueado</p>
                    <p className="text-xs text-muted-foreground">Sigue usando MovilityAI para desbloquear</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function getIconForBadge(iconName: string): string {
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
