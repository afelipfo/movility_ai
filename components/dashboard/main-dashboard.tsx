"use client"

import { useState } from "react"
import { RouteSearchForm } from "./route-search-form"
import { MapView } from "./map-view"
import { AlertsPanel } from "./alerts-panel"
import { RouteResults } from "./route-results"
import { RecommendationsPanel } from "./recommendations-panel"
import { Header } from "./header"
import { Leaderboard } from "./leaderboard"
import type { RouteOption, TrafficAlert, Recommendation } from "@/lib/agents/types"

export function MainDashboard() {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteOption[]>([])
  const [alerts, setAlerts] = useState<TrafficAlert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRouteSearch = async (data: {
    origin: { address: string; lat: number; lng: number }
    destination: { address: string; lat: number; lng: number }
    preferredModes: string[]
  }) => {
    setIsLoading(true)

    const { origin, destination, preferredModes } = data
    const modes = preferredModes.length ? preferredModes : ["transit", "walk"]

    const buildRoute = (id: string, factor: number): RouteOption => ({
      id,
      origin,
      destination,
      transportModes: modes,
      duration: Math.max(10, Math.round(22 * factor)),
      distance: Number((8.5 * factor).toFixed(1)),
      trafficLevel: factor > 1.1 ? "medium" : "low",
      steps: [],
      co2Emissions: Number((0.3 * factor).toFixed(2)),
      confidence: 0.75,
    })

    const primary = buildRoute("route-primary", 1)
    const alternatives = [
      buildRoute("route-alt-1", 1.1),
      buildRoute("route-alt-2", 0.92),
    ]

    setSelectedRoute(primary)
    setAlternativeRoutes(alternatives)
    setAlerts([])
    setRecommendations([])
    setIsLoading(false)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Search & Results */}
        <div className="flex w-full flex-col overflow-y-auto border-r border-border bg-card lg:w-96">
          <div className="p-4">
            <RouteSearchForm onSearch={handleRouteSearch} isLoading={isLoading} />
          </div>

          {selectedRoute && (
            <div className="flex-1 space-y-4 p-4">
              <RouteResults
                selectedRoute={selectedRoute}
                alternativeRoutes={alternativeRoutes}
                onSelectRoute={setSelectedRoute}
              />

              {recommendations.length > 0 && <RecommendationsPanel recommendations={recommendations} />}
            </div>
          )}
        </div>

        {/* Main Content - Map */}
        <div className="relative flex-1">
          <MapView selectedRoute={selectedRoute} alerts={alerts} />
        </div>

        {/* Right Sidebar - Alerts (Desktop only) */}
        <div className="hidden w-80 overflow-y-auto border-l border-border bg-card xl:block">
          <div className="flex h-full flex-col gap-4 p-4">
            <AlertsPanel alerts={alerts} />
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  )
}
