import type { AgentState, AgentMessage, AgentRole } from "./types"

/**
 * Supervisor Agent - Coordinates all other agents
 * Decides which agent should act next based on the current state
 */
export class SupervisorAgent {
  private agentSequence: AgentRole[] = [
    "data_collector",
    "traffic_analyzer",
    "route_planner",
    "alert_monitor",
    "recommendation_engine",
  ]

  async decide(state: AgentState): Promise<AgentRole | "end"> {
    console.log("[v0] Supervisor deciding next agent... Current:", state.currentAgent)

    // Check if we have errors that should stop processing
    if (state.errors.length > 3) {
      console.log("[v0] Supervisor: Too many errors, ending workflow")
      return "end"
    }

    // Determine next agent based on current state
    const currentIndex = this.agentSequence.indexOf(state.currentAgent as AgentRole)

    console.log("[v0] Supervisor: Current agent index:", currentIndex)

    // If we haven't started the sequence (supervisor is current)
    if (currentIndex === -1) {
      console.log("[v0] Supervisor: Starting sequence with data_collector")
      return "data_collector"
    }

    // Move to next agent in sequence
    if (currentIndex >= 0 && currentIndex < this.agentSequence.length - 1) {
      const nextAgent = this.agentSequence[currentIndex + 1]
      console.log("[v0] Supervisor: Moving to next agent:", nextAgent)
      return nextAgent
    }

    // We've completed the sequence
    console.log("[v0] Supervisor: Sequence completed, checking if we have complete response")

    // Check if we have enough data to provide a response
    if (this.hasCompleteResponse(state)) {
      console.log("[v0] Supervisor: Complete response found, ending workflow")
      return "end"
    }

    // If route planning failed, retry with different parameters
    if (state.routeOptions.length === 0) {
      console.log("[v0] Supervisor: No routes found, retrying route_planner")
      return "route_planner"
    }

    console.log("[v0] Supervisor: Ending workflow")
    return "end"
  }

  private hasCompleteResponse(state: AgentState): boolean {
    return state.routeOptions.length > 0 && state.trafficAlerts.length >= 0 && state.recommendations.length > 0
  }

  addMessage(state: AgentState, agent: string, content: string): AgentState {
    const message: AgentMessage = {
      agent,
      content,
      timestamp: new Date().toISOString(),
    }

    return {
      ...state,
      messages: [...state.messages, message],
    }
  }

  addError(state: AgentState, error: string): AgentState {
    return {
      ...state,
      errors: [...state.errors, error],
    }
  }

  addWarning(state: AgentState, warning: string): AgentState {
    return {
      ...state,
      warnings: [...state.warnings, warning],
    }
  }
}
