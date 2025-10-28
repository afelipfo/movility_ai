"use client"

import { TrendingUp, Clock, Leaf, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile } from "@/lib/types/database"

interface StatsOverviewProps {
  profile: Profile | null
}

export function StatsOverview({ profile }: StatsOverviewProps) {
  const stats = [
    {
      label: "Rutas Planificadas",
      value: profile?.total_routes_planned || 0,
      icon: MapPin,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Tiempo Ahorrado",
      value: `${profile?.total_time_saved_minutes || 0} min`,
      icon: Clock,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "CO2 Reducido",
      value: `${profile?.total_co2_saved_kg || 0} kg`,
      icon: Leaf,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Nivel",
      value: `Nivel ${profile?.level || 1}`,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
