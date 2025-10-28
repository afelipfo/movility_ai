"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Profile, RouteHistory } from "@/lib/types/database"

interface ImpactMetricsProps {
  profile: Profile | null
  recentRoutes: RouteHistory[]
}

export function ImpactMetrics({ profile, recentRoutes }: ImpactMetricsProps) {
  const nextLevelXP = (profile?.level || 1) * 100
  const currentXP = profile?.experience_points || 0
  const xpProgress = (currentXP / nextLevelXP) * 100

  const weeklyRoutes = recentRoutes.filter((route) => {
    const routeDate = new Date(route.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return routeDate > weekAgo
  }).length

  const weeklyGoal = 10
  const weeklyProgress = (weeklyRoutes / weeklyGoal) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso de Nivel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nivel {profile?.level || 1}</span>
            <span className="font-medium">
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{nextLevelXP - currentXP} XP para el siguiente nivel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meta Semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rutas esta semana</span>
            <span className="font-medium">
              {weeklyRoutes} / {weeklyGoal}
            </span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {weeklyGoal - weeklyRoutes > 0
              ? `${weeklyGoal - weeklyRoutes} rutas más para completar tu meta`
              : "Meta completada!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
