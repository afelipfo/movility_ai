// Agent state and types for LangGraph multi-agent system

export interface Location {
  address: string
  lat: number
  lng: number
}

export interface RouteOption {
  id: string
  origin: Location
  destination: Location
  transportModes: string[]
  duration: number // minutes
  distance: number // km
  steps: RouteStep[]
  trafficLevel: "low" | "medium" | "high" | "severe"
  estimatedCost?: number
  co2Emissions: number // kg
  confidence: number // 0-1
}

export interface RouteStep {
  instruction: string
  transportMode: string
  duration: number
  distance: number
  startLocation: Location
  endLocation: Location
}

export interface TrafficAlert {
  id: string
  type: "accident" | "construction" | "event" | "weather" | "protest" | "closure"
  severity: "low" | "medium" | "high" | "critical"
  location: Location
  description: string
  affectedRoutes: string[]
  source: string
  timestamp: string
}

export interface AgentState {
  // Input
  userId?: string
  query: string
  origin?: Location
  destination?: Location
  preferredModes?: string[]
  departureTime?: string

  // Processing
  currentAgent: string
  messages: AgentMessage[]

  // Route planning
  routeOptions: RouteOption[]
  selectedRoute?: RouteOption
  alternativeRoutes: RouteOption[]

  // Traffic analysis
  trafficAlerts: TrafficAlert[]
  trafficPredictions: TrafficPrediction[]
  congestionZones: CongestionZone[]

  // Recommendations
  recommendations: Recommendation[]
  optimizationSuggestions: string[]

  // Final output
  finalResponse: string
  confidence: number
  processingTime: number

  // Error handling
  errors: string[]
  warnings: string[]
}

export interface AgentMessage {
  agent: string
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface TrafficPrediction {
  zone: string
  location: Location
  predictedLevel: "low" | "medium" | "high" | "severe"
  confidence: number
  timeWindow: string
  factors: string[]
}

export interface CongestionZone {
  name: string
  location: Location
  radius: number // km
  currentLevel: "low" | "medium" | "high" | "severe"
  peakHours: string[]
}

export interface Recommendation {
  id: string
  type: "route" | "time" | "mode" | "alert"
  title: string
  description: string
  priority: "low" | "medium" | "high"
  potentialTimeSaved?: number
  potentialCO2Saved?: number
  actionable: boolean
}

export type AgentRole =
  | "supervisor"
  | "route_planner"
  | "traffic_analyzer"
  | "alert_monitor"
  | "recommendation_engine"
  | "data_collector"

export interface AgentConfig {
  role: AgentRole
  name: string
  description: string
  capabilities: string[]
  priority: number
}
