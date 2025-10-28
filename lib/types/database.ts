// Database types for TypeScript
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  preferred_transport_modes: string[]
  home_address: string | null
  home_lat: number | null
  home_lng: number | null
  work_address: string | null
  work_lat: number | null
  work_lng: number | null
  total_routes_planned: number
  total_time_saved_minutes: number
  total_co2_saved_kg: number
  total_distance_km: number
  level: number
  experience_points: number
  enable_traffic_alerts: boolean
  enable_route_suggestions: boolean
  enable_event_notifications: boolean
  created_at: string
  updated_at: string
}

export interface SavedRoute {
  id: string
  user_id: string
  name: string
  description: string | null
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  transport_modes: string[]
  estimated_duration_minutes: number | null
  estimated_distance_km: number | null
  is_favorite: boolean
  use_count: number
  created_at: string
  updated_at: string
}

export interface RouteHistory {
  id: string
  user_id: string
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  transport_modes: string[]
  actual_duration_minutes: number | null
  actual_distance_km: number | null
  ai_recommendation_used: boolean
  alternative_routes_count: number
  time_saved_minutes: number
  co2_saved_kg: number
  traffic_level: string | null
  created_at: string
}

export interface Alert {
  id: string
  title: string
  description: string
  alert_type: "accident" | "construction" | "event" | "weather" | "protest" | "closure"
  severity: "low" | "medium" | "high" | "critical"
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  affected_area_radius_km: number
  affected_streets: string[]
  affected_zones: string[]
  source: string
  source_url: string | null
  is_active: boolean
  start_time: string
  end_time: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_name: string
  category: "routes" | "eco" | "explorer" | "social" | "special"
  requirement_type: string
  requirement_value: number
  experience_points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: "alert" | "badge" | "route_suggestion" | "system"
  related_alert_id: string | null
  related_badge_id: string | null
  is_read: boolean
  created_at: string
}

export interface TrafficPrediction {
  id: string
  zone_name: string
  zone_lat: number
  zone_lng: number
  predicted_traffic_level: "low" | "medium" | "high" | "severe"
  confidence_score: number | null
  prediction_for_time: string
  prediction_window_minutes: number
  day_of_week: number | null
  hour_of_day: number | null
  is_holiday: boolean
  weather_condition: string | null
  model_version: string | null
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: "concert" | "sports" | "festival" | "conference" | "parade" | "other"
  venue_name: string | null
  venue_address: string | null
  venue_lat: number | null
  venue_lng: number | null
  start_time: string
  end_time: string
  expected_attendance: number | null
  traffic_impact_level: string | null
  source: string | null
  source_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
