/**
 * Google Maps API Integration - REAL IMPLEMENTATION
 * Handles route planning, geocoding, and traffic data using Google Maps APIs
 */

import axios from "axios"

// Google Maps API Response Types
export interface GoogleMapsRoute {
  legs: Array<{
    distance: { value: number; text: string }
    duration: { value: number; text: string }
    duration_in_traffic?: { value: number; text: string }
    steps: Array<{
      html_instructions: string
      distance: { value: number; text: string }
      duration: { value: number; text: string }
      travel_mode: string
      start_location: { lat: number; lng: number }
      end_location: { lat: number; lng: number }
      transit_details?: {
        line: {
          name: string
          short_name: string
          vehicle: { name: string; type: string }
        }
        departure_stop: { name: string; location: { lat: number; lng: number } }
        arrival_stop: { name: string; location: { lat: number; lng: number } }
      }
    }>
  }>
  overview_polyline: { points: string }
  warnings: string[]
  waypoint_order: number[]
  summary?: string
}

export class GoogleMapsService {
  private apiKey: string
  private baseURL = "https://maps.googleapis.com/maps/api"

  constructor() {
    // Try NEXT_PUBLIC_ prefixed key first (for Next.js), then fallback to non-prefixed (for scripts)
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || ""
    if (!this.apiKey) {
      console.warn("[GoogleMaps] API Key not found. Service will return null for all requests.")
    }
  }

  /**
   * Get directions between two points using Google Directions API
   */
  async getDirections(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    mode: "driving" | "walking" | "bicycling" | "transit" = "transit",
    departureTime?: Date,
  ): Promise<GoogleMapsRoute | null> {
    if (!this.apiKey) {
      console.error("[GoogleMaps] Cannot get directions: API key missing")
      return null
    }

    try {
      console.log("[GoogleMaps] Fetching directions:", { origin, destination, mode })

      // Format origin and destination
      const originStr = typeof origin === "string" ? origin : `${origin.lat},${origin.lng}`
      const destStr = typeof destination === "string" ? destination : `${destination.lat},${destination.lng}`

      // Build request parameters
      const params: Record<string, string> = {
        origin: originStr,
        destination: destStr,
        mode,
        key: this.apiKey,
        language: "es",
        region: "CO",
        alternatives: "true",
      }

      // Add departure time for transit and driving (for traffic data)
      if (departureTime) {
        params.departure_time = Math.floor(departureTime.getTime() / 1000).toString()
      } else if (mode === "transit" || mode === "driving") {
        params.departure_time = "now"
      }

      // Request traffic model for driving
      if (mode === "driving") {
        params.traffic_model = "best_guess"
      }

      const response = await axios.get(`${this.baseURL}/directions/json`, {
        params,
        timeout: 10000,
      })

      if (response.data.status === "OK" && response.data.routes.length > 0) {
        const route = response.data.routes[0]
        console.log("[GoogleMaps] Directions received successfully")
        return route
      } else if (response.data.status === "ZERO_RESULTS") {
        console.warn("[GoogleMaps] No routes found")
        return null
      } else {
        console.error("[GoogleMaps] API Error:", response.data.status, response.data.error_message)
        return null
      }
    } catch (error) {
      console.error("[GoogleMaps] Directions API error:", error)
      return null
    }
  }

  /**
   * Geocode an address to coordinates using Google Geocoding API
   */
  async geocode(address: string): Promise<{ lat: number; lng: number; formatted_address: string } | null> {
    if (!this.apiKey) {
      console.error("[GoogleMaps] Cannot geocode: API key missing")
      return null
    }

    try {
      console.log("[GoogleMaps] Geocoding address:", address)

      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          address,
          key: this.apiKey,
          region: "CO",
          language: "es",
          // Bias results to Medellín area
          bounds: "6.1,−75.7|6.4,−75.5",
        },
        timeout: 5000,
      })

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0]
        console.log("[GoogleMaps] Geocoded successfully:", result.formatted_address)

        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        }
      } else if (response.data.status === "ZERO_RESULTS") {
        console.warn("[GoogleMaps] No results found for address:", address)
        return null
      } else {
        console.error("[GoogleMaps] Geocoding error:", response.data.status, response.data.error_message)
        return null
      }
    } catch (error) {
      console.error("[GoogleMaps] Geocoding API error:", error)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to address using Google Geocoding API
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!this.apiKey) {
      console.error("[GoogleMaps] Cannot reverse geocode: API key missing")
      return null
    }

    try {
      console.log("[GoogleMaps] Reverse geocoding:", { lat, lng })

      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
          language: "es",
          result_type: "street_address|route",
        },
        timeout: 5000,
      })

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address
        console.log("[GoogleMaps] Reverse geocoded successfully:", address)
        return address
      } else {
        console.warn("[GoogleMaps] No address found for coordinates")
        return null
      }
    } catch (error) {
      console.error("[GoogleMaps] Reverse geocoding API error:", error)
      return null
    }
  }

  /**
   * Get real-time traffic conditions using Directions API with traffic model
   * Compares normal duration vs duration in traffic
   */
  async getTrafficConditions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<"low" | "medium" | "high" | "severe"> {
    try {
      const route = await this.getDirections(origin, destination, "driving", new Date())

      if (!route || !route.legs || route.legs.length === 0) {
        // Fallback to time-based estimation
        return this.estimateTrafficByTime()
      }

      const leg = route.legs[0]
      const normalDuration = leg.duration.value // seconds
      const trafficDuration = leg.duration_in_traffic?.value || normalDuration

      // Calculate delay ratio
      const delayRatio = trafficDuration / normalDuration

      console.log("[GoogleMaps] Traffic analysis:", {
        normal: normalDuration,
        traffic: trafficDuration,
        ratio: delayRatio,
      })

      // Classify traffic based on delay
      if (delayRatio >= 2.0) return "severe" // 2x+ slower
      if (delayRatio >= 1.5) return "high" // 50%+ slower
      if (delayRatio >= 1.2) return "medium" // 20%+ slower
      return "low"
    } catch (error) {
      console.error("[GoogleMaps] Traffic conditions error:", error)
      return this.estimateTrafficByTime()
    }
  }

  /**
   * Fallback method to estimate traffic based on time of day
   */
  private estimateTrafficByTime(): "low" | "medium" | "high" | "severe" {
    const hour = new Date().getHours()
    const day = new Date().getDay()

    // Weekend traffic is generally lighter
    if (day === 0 || day === 6) {
      if ((hour >= 10 && hour <= 13) || (hour >= 18 && hour <= 20)) {
        return "medium"
      }
      return "low"
    }

    // Weekday rush hours in Medellín
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return "high"
    } else if ((hour >= 5 && hour < 6) || (hour >= 9 && hour < 10) || (hour >= 16 && hour < 17)) {
      return "medium"
    }

    return "low"
  }

  /**
   * Get multiple alternative routes
   */
  async getAlternativeRoutes(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    modes: Array<"driving" | "walking" | "bicycling" | "transit">,
  ): Promise<Array<{ mode: string; route: GoogleMapsRoute }>> {
    const results: Array<{ mode: string; route: GoogleMapsRoute }> = []

    for (const mode of modes) {
      const route = await this.getDirections(origin, destination, mode)
      if (route) {
        results.push({ mode, route })
      }
    }

    return results
  }

  /**
   * Calculate distance matrix for multiple origins and destinations
   */
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: "driving" | "walking" | "bicycling" | "transit" = "driving",
  ): Promise<any> {
    if (!this.apiKey) {
      console.error("[GoogleMaps] Cannot get distance matrix: API key missing")
      return null
    }

    try {
      const originsStr = origins.map((o) => `${o.lat},${o.lng}`).join("|")
      const destinationsStr = destinations.map((d) => `${d.lat},${d.lng}`).join("|")

      const response = await axios.get(`${this.baseURL}/distancematrix/json`, {
        params: {
          origins: originsStr,
          destinations: destinationsStr,
          mode,
          key: this.apiKey,
          language: "es",
          departure_time: "now",
        },
        timeout: 10000,
      })

      if (response.data.status === "OK") {
        return response.data
      } else {
        console.error("[GoogleMaps] Distance Matrix error:", response.data.status)
        return null
      }
    } catch (error) {
      console.error("[GoogleMaps] Distance Matrix API error:", error)
      return null
    }
  }

  /**
   * Search for places (useful for finding transit stations, bike stations, etc.)
   */
  async searchNearby(
    location: { lat: number; lng: number },
    type: string,
    radius: number = 1000,
  ): Promise<any[]> {
    if (!this.apiKey) {
      console.error("[GoogleMaps] Cannot search places: API key missing")
      return []
    }

    try {
      const response = await axios.get(`${this.baseURL}/place/nearbysearch/json`, {
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type,
          key: this.apiKey,
          language: "es",
        },
        timeout: 5000,
      })

      if (response.data.status === "OK") {
        return response.data.results
      } else {
        console.error("[GoogleMaps] Places search error:", response.data.status)
        return []
      }
    } catch (error) {
      console.error("[GoogleMaps] Places API error:", error)
      return []
    }
  }
}
