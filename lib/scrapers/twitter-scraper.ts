/**
 * Twitter Scraper for Traffic Alerts - REAL IMPLEMENTATION
 * Uses Twitter API v2 to monitor official accounts for traffic updates
 */

import axios from "axios"
import { findCriticalZoneByText, type CriticalZone } from "../config/medellin-zones"

export interface TwitterAlert {
  id: string
  text: string
  author: string
  timestamp: string
  location?: string
  hashtags: string[]
  mentions: string[]
  coordinates?: { lat: number; lng: number }
  criticalZone?: CriticalZone // Detected critical zone
}

export class TwitterScraperService {
  private apiKey: string
  private baseURL = "https://api.twitter.com/2"

  // Official traffic accounts to monitor in Medellín
  private monitoredAccounts = [
    { username: "TransitoMed", userId: "" }, // Tránsito de Medellín
    { username: "MetrodeMedellin", userId: "" }, // Metro de Medellín
    { username: "AlcaldiadeMed", userId: "" }, // Alcaldía de Medellín
    { username: "PoliciaMedellin", userId: "" }, // Policía de Medellín
  ]

  constructor() {
    this.apiKey = process.env.TWITTER_BEARER_TOKEN || ""
    if (!this.apiKey) {
      console.warn("[TwitterScraper] Bearer Token not found. Service will return mock data.")
    }
  }

  /**
   * Scrape recent tweets from monitored accounts using Twitter API v2
   */
  async scrapeTrafficAlerts(): Promise<TwitterAlert[]> {
    // If no API key, return mock data
    if (!this.apiKey) {
      console.warn("[TwitterScraper] Using mock data - no API key configured")
      return this.getMockData()
    }

    try {
      console.log("[TwitterScraper] Fetching tweets from official accounts...")

      const allTweets: TwitterAlert[] = []

      // Fetch tweets from each monitored account
      for (const account of this.monitoredAccounts) {
        try {
          const tweets = await this.fetchUserTweets(account.username)
          allTweets.push(...tweets)
        } catch (error) {
          console.error(`[TwitterScraper] Error fetching tweets from @${account.username}:`, error)
          // Continue with other accounts
        }
      }

      // Sort by timestamp (newest first)
      allTweets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      console.log(`[TwitterScraper] Fetched ${allTweets.length} tweets from ${this.monitoredAccounts.length} accounts`)

      return allTweets
    } catch (error) {
      console.error("[TwitterScraper] Twitter scraping error:", error)
      // Fallback to mock data
      return this.getMockData()
    }
  }

  /**
   * Fetch recent tweets from a specific user using Twitter API v2
   */
  private async fetchUserTweets(username: string): Promise<TwitterAlert[]> {
    try {
      // Step 1: Get user ID from username
      const userResponse = await axios.get(`${this.baseURL}/users/by/username/${username}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      })

      if (!userResponse.data.data) {
        console.warn(`[TwitterScraper] User @${username} not found`)
        return []
      }

      const userId = userResponse.data.data.id

      // Step 2: Get user's recent tweets
      const tweetsResponse = await axios.get(`${this.baseURL}/users/${userId}/tweets`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: {
          max_results: 10, // Get last 10 tweets
          "tweet.fields": "created_at,entities,geo",
          expansions: "geo.place_id",
        },
        timeout: 10000,
      })

      if (!tweetsResponse.data.data) {
        console.log(`[TwitterScraper] No recent tweets from @${username}`)
        return []
      }

      // Parse and filter tweets
      const alerts: TwitterAlert[] = tweetsResponse.data.data
        .filter((tweet: any) => this.isTrafficRelated(tweet.text))
        .map((tweet: any) => this.parseTweet(tweet, username))

      return alerts
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error("[TwitterScraper] Rate limit exceeded. Waiting...")
      } else {
        console.error(`[TwitterScraper] Error fetching tweets from @${username}:`, error.message)
      }
      return []
    }
  }

  /**
   * Parse a raw tweet into TwitterAlert format
   */
  private parseTweet(tweet: any, username: string): TwitterAlert {
    const text = tweet.text
    const entities = tweet.entities || {}

    // Extract hashtags
    const hashtags = (entities.hashtags || []).map((h: any) => h.tag)

    // Extract mentions
    const mentions = (entities.mentions || []).map((m: any) => `@${m.username}`)

    // Extract location from text
    const location = this.extractLocation(text)

    // Detect critical zone from text
    const criticalZone = findCriticalZoneByText(text)

    // If critical zone detected, use its coordinates
    let coordinates: { lat: number; lng: number } | undefined
    if (criticalZone) {
      coordinates = criticalZone.coordinates.center
      console.log(`[TwitterScraper] Detected critical zone: ${criticalZone.name}`)
    }

    return {
      id: tweet.id,
      text: text,
      author: `@${username}`,
      timestamp: tweet.created_at,
      location: location || criticalZone?.name,
      hashtags,
      mentions,
      coordinates,
      criticalZone,
    }
  }

  /**
   * Check if tweet is traffic-related
   */
  private isTrafficRelated(text: string): boolean {
    const trafficKeywords = [
      "tráfico",
      "trafico",
      "tránsito",
      "transito",
      "accidente",
      "choque",
      "congestión",
      "congestion",
      "vía",
      "via",
      "cerrada",
      "cierre",
      "obra",
      "manifestación",
      "manifestacion",
      "protesta",
      "metro",
      "bus",
      "autopista",
      "avenida",
      "calle",
      "carrera",
      "ruta",
      "desvío",
      "desvio",
    ]

    const lowerText = text.toLowerCase()
    return trafficKeywords.some((keyword) => lowerText.includes(keyword))
  }

  /**
   * Get mock data as fallback
   */
  private getMockData(): TwitterAlert[] {
    const mockTweets = [
      {
        id: "mock-1",
        text: "ATENCIÓN: Accidente en Autopista Sur altura de Envigado. Vía cerrada parcialmente. Busque rutas alternas. #TránsitoMedellín",
        author: "@TransitoMed",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        location: "Autopista Sur, Envigado",
        hashtags: ["TránsitoMedellín"],
        mentions: [],
      },
      {
        id: "mock-2",
        text: "Obras de mantenimiento en Avenida Oriental con Calle 33. Carril derecho cerrado hasta las 18:00. #ObrasMedellín",
        author: "@AlcaldiadeMed",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        location: "Avenida Oriental con Calle 33",
        hashtags: ["ObrasMedellín"],
        mentions: [],
      },
      {
        id: "mock-3",
        text: "Congestión severa en Autopista Norte a la altura de Bello. Demora de 35 minutos. #TránsitoMedellín",
        author: "@TransitoMed",
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        location: "Autopista Norte, Bello",
        hashtags: ["TránsitoMedellín"],
        mentions: [],
      },
      {
        id: "mock-4",
        text: "Calle 33 con tráfico lento entre Carrera 70 y Avenida Oriental. Precaución. #Medellín",
        author: "@TransitoMed",
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        location: "Calle 33",
        hashtags: ["Medellín"],
        mentions: [],
      },
    ]

    // Enrich mock data with critical zone detection
    return mockTweets.map((tweet) => {
      const criticalZone = findCriticalZoneByText(tweet.text)
      return {
        ...tweet,
        criticalZone,
        coordinates: criticalZone?.coordinates.center,
      }
    })
  }

  /**
   * Extract location from tweet text using NLP patterns
   * Identifies streets, avenues, neighborhoods, and landmarks in Medellín
   */
  extractLocation(text: string): string | undefined {
    // Known locations in Medellín
    const landmarks = [
      "Plaza Botero",
      "Parque Lleras",
      "Parque Berrío",
      "Terminal del Sur",
      "Terminal del Norte",
      "Aeropuerto",
      "Estadio",
      "Universidad de Antioquia",
      "Alpujarra",
      "Nutibara",
      "Oviedo",
      "Envigado",
      "Sabaneta",
      "Itagüí",
      "Bello",
      "Poblado",
      "Laureles",
      "Centro",
    ]

    // Main streets/avenues in Medellín
    const majorRoads = [
      "Autopista Norte",
      "Autopista Sur",
      "Avenida Oriental",
      "Avenida 33",
      "Avenida El Poblado",
      "Avenida Las Vegas",
      "Carrera 70",
      "Carrera 80",
      "Carrera 65",
      "Calle 10",
      "Calle 33",
      "Calle 50",
      "Regional",
      "Las Palmas",
    ]

    // Pattern 1: Check for landmarks
    for (const landmark of landmarks) {
      if (text.includes(landmark)) {
        return landmark
      }
    }

    // Pattern 2: Check for major roads
    for (const road of majorRoads) {
      if (text.includes(road)) {
        // Try to get more specific location (e.g., "con Calle 10", "altura de")
        const moreSpecific = this.extractSpecificLocation(text, road)
        return moreSpecific || road
      }
    }

    // Pattern 3: Generic street patterns (Avenida X, Calle Y, Carrera Z)
    const streetPatterns = [
      /(?:en|sobre|por)\s+(Avenida|Calle|Carrera|Diagonal|Transversal)\s+([0-9]+[A-Z]?)/i,
      /(Avenida|Calle|Carrera|Diagonal|Transversal)\s+([0-9]+[A-Z]?)\s+(?:con|y|#)\s+([0-9]+[A-Z]?)/i,
    ]

    for (const pattern of streetPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0].trim()
      }
    }

    // Pattern 4: Intersections
    const intersectionPattern = /(?:altura|cruce|esquina)\s+(?:de|con)?\s+([^.,]+)/i
    const intersectionMatch = text.match(intersectionPattern)
    if (intersectionMatch) {
      return intersectionMatch[0].trim()
    }

    return undefined
  }

  /**
   * Extract more specific location details
   */
  private extractSpecificLocation(text: string, baseLocation: string): string | undefined {
    // Look for patterns like "con", "altura de", "entre", etc.
    const patterns = [
      new RegExp(`${baseLocation}\\s+(?:con|y|altura de|entre)\\s+([^.,]+)`, "i"),
      new RegExp(`${baseLocation}\\s+-\\s+([^.,]+)`, "i"),
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0].trim()
      }
    }

    return undefined
  }

  /**
   * Parse tweet text to extract alert information
   */
  parseAlert(tweet: TwitterAlert): {
    type: "accident" | "construction" | "event" | "weather" | "protest" | "closure"
    severity: "low" | "medium" | "high" | "critical"
    description: string
  } {
    const text = tweet.text.toLowerCase()

    // Determine type
    let type: "accident" | "construction" | "event" | "weather" | "protest" | "closure" = "event"
    if (text.includes("accidente") || text.includes("choque") || text.includes("colisión")) type = "accident"
    else if (text.includes("obra") || text.includes("mantenimiento") || text.includes("reparación"))
      type = "construction"
    else if (text.includes("manifestación") || text.includes("protesta") || text.includes("plantón"))
      type = "protest"
    else if (text.includes("cerrada") || text.includes("cierre") || text.includes("bloqueada")) type = "closure"
    else if (text.includes("lluvia") || text.includes("clima") || text.includes("inundación")) type = "weather"

    // Determine severity
    let severity: "low" | "medium" | "high" | "critical" = "medium"
    if (text.includes("atención") || text.includes("urgente") || text.includes("crítico") || text.includes("grave"))
      severity = "critical"
    else if (
      text.includes("importante") ||
      text.includes("cerrada totalmente") ||
      text.includes("vía cerrada") ||
      text.includes("no circular")
    )
      severity = "high"
    else if (text.includes("precaución") || text.includes("cuidado") || text.includes("lento")) severity = "medium"
    else severity = "low"

    return {
      type,
      severity,
      description: tweet.text,
    }
  }
}
