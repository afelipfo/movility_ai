import type { AgentState, Recommendation } from "./types"

/**
 * Recommendation Engine Agent - Generates personalized recommendations
 * Based on user preferences, traffic conditions, and historical data
 */
export class RecommendationEngineAgent {
  async recommend(state: AgentState): Promise<AgentState> {
    console.log("[v0] Recommendation Engine Agent starting...")

    try {
      const recommendations: Recommendation[] = []

      // Generate route recommendations
      recommendations.push(...this.generateRouteRecommendations(state))

      // Generate time recommendations
      recommendations.push(...this.generateTimeRecommendations(state))

      // Generate mode recommendations
      recommendations.push(...this.generateModeRecommendations(state))

      // Generate alert-based recommendations
      recommendations.push(...this.generateAlertRecommendations(state))

      // Prioritize recommendations
      const prioritized = this.prioritizeRecommendations(recommendations)

      // Generate optimization suggestions
      const optimizations = this.generateOptimizationSuggestions(state)

      return {
        ...state,
        currentAgent: "recommendation_engine",
        recommendations: prioritized,
        optimizationSuggestions: optimizations,
        messages: [
          ...state.messages,
          {
            agent: "recommendation_engine",
            content: `Generated ${recommendations.length} recommendations`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    } catch (error) {
      console.error("[v0] Recommendation error:", error)
      return {
        ...state,
        errors: [...state.errors, `Recommendation generation failed: ${error}`],
      }
    }
  }

  private generateRouteRecommendations(state: AgentState): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (state.selectedRoute && state.alternativeRoutes.length > 0) {
      const alternative = state.alternativeRoutes[0]
      const timeDiff = state.selectedRoute.duration - alternative.duration

      if (timeDiff > 5) {
        recommendations.push({
          id: "rec-route-1",
          type: "route",
          title: "Ruta alternativa más rápida",
          description: `Considera usar ${alternative.transportModes.join(" + ")} para ahorrar ${timeDiff} minutos`,
          priority: "high",
          potentialTimeSaved: timeDiff,
          actionable: true,
        })
      }
    }

    return recommendations
  }

  private generateTimeRecommendations(state: AgentState): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Check if departure time is during peak hours
    const now = new Date()
    const hour = now.getHours()

    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      recommendations.push({
        id: "rec-time-1",
        type: "time",
        title: "Evita hora pico",
        description: "Estás viajando en hora pico. Considera salir 30 minutos antes o después para ahorrar tiempo.",
        priority: "medium",
        potentialTimeSaved: 15,
        actionable: true,
      })
    }

    return recommendations
  }

  private generateModeRecommendations(state: AgentState): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (state.selectedRoute) {
      // Recommend metro if not using it
      if (!state.selectedRoute.transportModes.includes("metro")) {
        recommendations.push({
          id: "rec-mode-1",
          type: "mode",
          title: "Usa el Metro",
          description: "El Metro es más rápido y confiable durante horas pico. Considera incluirlo en tu ruta.",
          priority: "medium",
          potentialTimeSaved: 10,
          potentialCO2Saved: 0.5,
          actionable: true,
        })
      }

      // Recommend walking for short distances
      if (state.selectedRoute.distance < 1.5 && !state.selectedRoute.transportModes.includes("walk")) {
        recommendations.push({
          id: "rec-mode-2",
          type: "mode",
          title: "Camina",
          description: "La distancia es corta. Caminar es saludable y reduce tu huella de carbono.",
          priority: "low",
          potentialCO2Saved: state.selectedRoute.co2Emissions,
          actionable: true,
        })
      }
    }

    return recommendations
  }

  private generateAlertRecommendations(state: AgentState): Recommendation[] {
    const recommendations: Recommendation[] = []

    state.trafficAlerts.forEach((alert) => {
      if (alert.severity === "critical" || alert.severity === "high") {
        recommendations.push({
          id: `rec-alert-${alert.id}`,
          type: "alert",
          title: `Alerta: ${alert.type}`,
          description: `${alert.description} Considera una ruta alternativa.`,
          priority: alert.severity === "critical" ? "high" : "medium",
          actionable: true,
        })
      }
    })

    return recommendations
  }

  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private generateOptimizationSuggestions(state: AgentState): string[] {
    const suggestions: string[] = []

    if (state.selectedRoute) {
      if (state.selectedRoute.co2Emissions > 2) {
        suggestions.push("Considera usar transporte público para reducir tu huella de carbono")
      }

      if (state.selectedRoute.estimatedCost && state.selectedRoute.estimatedCost > 5) {
        suggestions.push("Busca opciones más económicas como caminar o usar bicicleta")
      }

      if (state.trafficAlerts.length > 2) {
        suggestions.push("Hay múltiples alertas activas. Considera retrasar tu viaje si es posible")
      }
    }

    return suggestions
  }
}
