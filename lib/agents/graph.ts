import { StateGraph, END } from "@langchain/langgraph"
import type { AgentState, AgentRole } from "./types"
import { SupervisorAgent } from "./supervisor"
import { DataCollectorAgent } from "./data-collector"
import { RoutePlannerAgent } from "./route-planner"
import { TrafficAnalyzerAgent } from "./traffic-analyzer"
import { AlertMonitorAgent } from "./alert-monitor"
import { RecommendationEngineAgent } from "./recommendation-engine"

/**
 * LangGraph Multi-Agent System for MovilityAI
 * Orchestrates multiple specialized agents to provide intelligent route planning
 */

// Initialize all agents
const supervisor = new SupervisorAgent()
const dataCollector = new DataCollectorAgent()
const routePlanner = new RoutePlannerAgent()
const trafficAnalyzer = new TrafficAnalyzerAgent()
const alertMonitor = new AlertMonitorAgent()
const recommendationEngine = new RecommendationEngineAgent()

// Define agent nodes
async function dataCollectorNode(state: AgentState): Promise<AgentState> {
  console.log("[v0] Executing Data Collector Node")
  return await dataCollector.collect(state)
}

async function trafficAnalyzerNode(state: AgentState): Promise<AgentState> {
  console.log("[v0] Executing Traffic Analyzer Node")
  return await trafficAnalyzer.analyze(state)
}

async function routePlannerNode(state: AgentState): Promise<AgentState> {
  console.log("[v0] Executing Route Planner Node")
  return await routePlanner.plan(state)
}

async function alertMonitorNode(state: AgentState): Promise<AgentState> {
  console.log("[v0] Executing Alert Monitor Node")
  return await alertMonitor.monitor(state)
}

async function recommendationEngineNode(state: AgentState): Promise<AgentState> {
  console.log("[v0] Executing Recommendation Engine Node")
  return await recommendationEngine.recommend(state)
}

async function supervisorNode(state: AgentState): Promise<Partial<AgentState>> {
  console.log("[v0] Executing Supervisor Node")
  const nextAgent = await supervisor.decide(state)

  return {
    ...state,
    currentAgent: nextAgent === "end" ? "supervisor" : nextAgent,
  }
}

// Define routing logic
function routeAgent(state: AgentState): AgentRole | typeof END {
  const currentAgent = state.currentAgent

  console.log(`[v0] Routing from agent: ${currentAgent}`)

  // If supervisor decided to end, finish the workflow
  if (currentAgent === "supervisor" || currentAgent === "end") {
    return END
  }

  // Route to the next agent
  return currentAgent as AgentRole
}

// Create the state graph
const workflow = new StateGraph<AgentState>({
  channels: {
    userId: null,
    query: null,
    origin: null,
    destination: null,
    preferredModes: null,
    departureTime: null,
    currentAgent: null,
    messages: null,
    routeOptions: null,
    selectedRoute: null,
    alternativeRoutes: null,
    trafficAlerts: null,
    trafficPredictions: null,
    congestionZones: null,
    recommendations: null,
    optimizationSuggestions: null,
    finalResponse: null,
    confidence: null,
    processingTime: null,
    errors: null,
    warnings: null,
  },
})

// Add nodes to the graph
workflow.addNode("supervisor", supervisorNode)
workflow.addNode("data_collector", dataCollectorNode)
workflow.addNode("traffic_analyzer", trafficAnalyzerNode)
workflow.addNode("route_planner", routePlannerNode)
workflow.addNode("alert_monitor", alertMonitorNode)
workflow.addNode("recommendation_engine", recommendationEngineNode)

// Define edges
workflow.addEdge("data_collector", "supervisor")
workflow.addEdge("traffic_analyzer", "supervisor")
workflow.addEdge("route_planner", "supervisor")
workflow.addEdge("alert_monitor", "supervisor")
workflow.addEdge("recommendation_engine", "supervisor")

// Add conditional edges from supervisor
workflow.addConditionalEdges("supervisor", routeAgent, {
  data_collector: "data_collector",
  traffic_analyzer: "traffic_analyzer",
  route_planner: "route_planner",
  alert_monitor: "alert_monitor",
  recommendation_engine: "recommendation_engine",
  [END]: END,
})

// Set entry point
workflow.setEntryPoint("supervisor")

// Compile the graph with increased recursion limit
export const movilityAIGraph = workflow.compile({
  recursionLimit: 50,
})

/**
 * Execute the MovilityAI multi-agent system
 */
export async function executeMovilityAI(input: {
  userId?: string
  query: string
  origin?: { address: string; lat: number; lng: number }
  destination?: { address: string; lat: number; lng: number }
  preferredModes?: string[]
  departureTime?: string
}): Promise<AgentState> {
  const startTime = Date.now()

  // Initialize state
  const initialState: AgentState = {
    userId: input.userId,
    query: input.query,
    origin: input.origin,
    destination: input.destination,
    preferredModes: input.preferredModes || ["metro", "bus", "walk"],
    departureTime: input.departureTime || new Date().toISOString(),
    currentAgent: "supervisor",
    messages: [],
    routeOptions: [],
    alternativeRoutes: [],
    trafficAlerts: [],
    trafficPredictions: [],
    congestionZones: [],
    recommendations: [],
    optimizationSuggestions: [],
    finalResponse: "",
    confidence: 0,
    processingTime: 0,
    errors: [],
    warnings: [],
  }

  console.log("[v0] Starting MovilityAI multi-agent system...")
  console.log("[v0] Input:", input)

  try {
    // Execute the graph
    const result = await movilityAIGraph.invoke(initialState)

    // Calculate processing time
    const processingTime = Date.now() - startTime

    // Generate final response
    const finalResponse = generateFinalResponse(result)

    return {
      ...result,
      finalResponse,
      processingTime,
      confidence: calculateConfidence(result),
    }
  } catch (error) {
    console.error("[v0] MovilityAI execution error:", error)
    return {
      ...initialState,
      errors: [...initialState.errors, `System error: ${error}`],
      finalResponse: "Lo siento, hubo un error procesando tu solicitud. Por favor intenta de nuevo.",
      processingTime: Date.now() - startTime,
      confidence: 0,
    }
  }
}

/**
 * Generate human-readable final response
 */
function generateFinalResponse(state: AgentState): string {
  if (state.errors.length > 0) {
    return `Lo siento, encontré algunos problemas: ${state.errors.join(", ")}`
  }

  if (!state.selectedRoute) {
    return "No pude encontrar una ruta óptima. Por favor verifica los datos e intenta de nuevo."
  }

  const route = state.selectedRoute
  const alerts = state.trafficAlerts.filter((a) => a.severity === "high" || a.severity === "critical")
  const topRecommendations = state.recommendations.slice(0, 3)

  let response = `🚇 **Ruta Recomendada**\n\n`
  response += `📍 Desde: ${route.origin.address}\n`
  response += `📍 Hasta: ${route.destination.address}\n\n`
  response += `⏱️ Duración: ${route.duration} minutos\n`
  response += `📏 Distancia: ${route.distance} km\n`
  response += `🚌 Modos: ${route.transportModes.join(" → ")}\n`
  response += `💰 Costo estimado: $${route.estimatedCost?.toFixed(2) || "0.00"}\n`
  response += `🌱 CO2: ${route.co2Emissions} kg\n`
  response += `🚦 Tráfico: ${route.trafficLevel}\n\n`

  if (alerts.length > 0) {
    response += `⚠️ **Alertas Activas** (${alerts.length})\n`
    alerts.forEach((alert) => {
      response += `• ${alert.description}\n`
    })
    response += `\n`
  }

  if (topRecommendations.length > 0) {
    response += `💡 **Recomendaciones**\n`
    topRecommendations.forEach((rec) => {
      response += `• ${rec.title}: ${rec.description}\n`
    })
  }

  return response
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(state: AgentState): number {
  let confidence = 1.0

  // Reduce confidence for errors
  confidence -= state.errors.length * 0.2

  // Reduce confidence for warnings
  confidence -= state.warnings.length * 0.1

  // Reduce confidence if no route found
  if (!state.selectedRoute) {
    confidence -= 0.5
  }

  // Reduce confidence for high traffic
  if (state.trafficAlerts.length > 3) {
    confidence -= 0.1
  }

  return Math.max(0, Math.min(1, confidence))
}
