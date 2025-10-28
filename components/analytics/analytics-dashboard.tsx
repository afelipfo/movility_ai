"use client"

import { Header } from "@/components/dashboard/header"
import { StatsOverview } from "./stats-overview"
import { BadgesSection } from "./badges-section"
import { RouteHistoryChart } from "./route-history-chart"
import { ImpactMetrics } from "./impact-metrics"
import type { Profile, UserBadge, RouteHistory } from "@/lib/types/database"

interface AnalyticsDashboardProps {
  profile: Profile | null
  userBadges: (UserBadge & { badge: any })[]
  recentRoutes: RouteHistory[]
}

export function AnalyticsDashboard({ profile, userBadges, recentRoutes }: AnalyticsDashboardProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Tu Dashboard</h1>
            <p className="text-muted-foreground">Visualiza tu impacto y progreso en movilidad sostenible</p>
          </div>

          {/* Stats Overview */}
          <StatsOverview profile={profile} />

          {/* Impact Metrics */}
          <ImpactMetrics profile={profile} recentRoutes={recentRoutes} />

          {/* Badges Section */}
          <BadgesSection userBadges={userBadges} profile={profile} />

          {/* Route History Chart */}
          <RouteHistoryChart recentRoutes={recentRoutes} />
        </div>
      </main>
    </div>
  )
}
