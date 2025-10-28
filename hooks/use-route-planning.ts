"use client"

import { useState } from "react"
import type { RouteOption, TrafficAlert, Recommendation } from "@/lib/agents/types"

interface RoutePlanningState {
  selectedRoute: RouteOption | null
  alternativeRoutes: RouteOption[]
  alerts: TrafficAlert[]
  recommendations: Recommendation[]
  isLoading: boolean
  error: string | null
}

export function useRoutePlanning() {
  const [state, setState] = useState<RoutePlanningState>({
    selectedRoute: null,
    alternativeRoutes: [],
    alerts: [],
    recommendations: [],
    isLoading: false,
    error: null,
  })

  const planRoute = async (data: {
    origin: { address: string; lat: number; lng: number }
    destination: { address: string; lat: number; lng: number }
    preferredModes: string[]
  }) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch("/api/route-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setState({
          selectedRoute: result.data.selectedRoute,
          alternativeRoutes: result.data.alternativeRoutes,
          alerts: result.data.trafficAlerts,
          recommendations: result.data.recommendations,
          isLoading: false,
          error: null,
        })
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Error al planificar ruta",
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error de conexión",
      }))
    }
  }

  const saveRoute = async (routeData: any) => {
    try {
      const response = await fetch("/api/routes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      })

      return await response.json()
    } catch (error) {
      console.error("[v0] Error saving route:", error)
      return { success: false, error: "Error al guardar ruta" }
    }
  }

  return {
    ...state,
    planRoute,
    saveRoute,
  }
}
