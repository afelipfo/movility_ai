/**
 * Critical Traffic Zones in Medellín
 * Based on the MovilityAI challenge requirements
 *
 * These zones are known congestion points that need special monitoring
 */

export interface CriticalZone {
  id: string
  name: string
  type: "highway" | "avenue" | "street" | "intersection"
  description: string
  coordinates: {
    center: { lat: number; lng: number }
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  keywords: string[] // For text matching in alerts
  peakHours: string[]
  averageDelay: number // Average delay in minutes during peak hours
  priority: "critical" | "high" | "medium"
}

/**
 * Critical zones in Medellín that require special monitoring
 * According to the challenge, these are the main congestion points
 */
export const CRITICAL_ZONES: CriticalZone[] = [
  {
    id: "autopista-norte",
    name: "Autopista Norte",
    type: "highway",
    description: "Autopista Norte - Corredor principal hacia el norte de la ciudad con alta congestión",
    coordinates: {
      center: { lat: 6.2704, lng: -75.5664 },
      bounds: {
        north: 6.35,
        south: 6.25,
        east: -75.55,
        west: -75.58,
      },
    },
    keywords: [
      "autopista norte",
      "autop norte",
      "au norte",
      "bello",
      "caribe",
      "terminal norte",
    ],
    peakHours: ["06:30-09:00", "17:00-20:00"],
    averageDelay: 40, // 40 minutes delay reported in challenge
    priority: "critical",
  },
  {
    id: "autopista-sur",
    name: "Autopista Sur",
    type: "highway",
    description: "Autopista Sur - Corredor principal hacia el sur (Envigado, Sabaneta, Itagüí) con alta congestión",
    coordinates: {
      center: { lat: 6.1701, lng: -75.5906 },
      bounds: {
        north: 6.24,
        south: 6.12,
        east: -75.56,
        west: -75.62,
      },
    },
    keywords: [
      "autopista sur",
      "autop sur",
      "au sur",
      "envigado",
      "sabaneta",
      "itagüí",
      "las vegas",
      "mayorca",
    ],
    peakHours: ["06:30-09:00", "17:00-20:00"],
    averageDelay: 40, // 40 minutes delay reported in challenge
    priority: "critical",
  },
  {
    id: "avenida-33",
    name: "Avenida 33 (Calle 33)",
    type: "avenue",
    description: "Calle 33 - Una de las avenidas más transitadas que cruza la ciudad de oriente a occidente",
    coordinates: {
      center: { lat: 6.2442, lng: -75.5812 },
      bounds: {
        north: 6.25,
        south: 6.24,
        east: -75.55,
        west: -75.61,
      },
    },
    keywords: [
      "calle 33",
      "avenida 33",
      "av 33",
      "33",
      "san juan",
    ],
    peakHours: ["07:00-09:00", "17:30-19:30"],
    averageDelay: 35,
    priority: "critical",
  },
  {
    id: "avenida-oriental",
    name: "Avenida Oriental",
    type: "avenue",
    description: "Avenida Oriental - Corredor central de la ciudad con alto flujo vehicular",
    coordinates: {
      center: { lat: 6.2442, lng: -75.5636 },
      bounds: {
        north: 6.28,
        south: 6.21,
        east: -75.56,
        west: -75.57,
      },
    },
    keywords: [
      "avenida oriental",
      "av oriental",
      "oriental",
      "carrera 43",
    ],
    peakHours: ["07:00-09:00", "17:00-19:00"],
    averageDelay: 30,
    priority: "critical",
  },
  {
    id: "carrera-70",
    name: "Carrera 70 (Avenida 80)",
    type: "avenue",
    description: "Carrera 70 - Importante corredor hacia el occidente de la ciudad",
    coordinates: {
      center: { lat: 6.2456, lng: -75.5908 },
      bounds: {
        north: 6.29,
        south: 6.20,
        east: -75.58,
        west: -75.60,
      },
    },
    keywords: [
      "carrera 70",
      "cr 70",
      "avenida 80",
      "av 80",
      "robledo",
      "conquistadores",
    ],
    peakHours: ["07:00-09:00", "17:00-19:00"],
    averageDelay: 25,
    priority: "high",
  },
  {
    id: "avenida-poblado",
    name: "Avenida El Poblado",
    type: "avenue",
    description: "Avenida El Poblado - Zona comercial y residencial con alta congestión",
    coordinates: {
      center: { lat: 6.2088, lng: -75.5673 },
      bounds: {
        north: 6.25,
        south: 6.17,
        east: -75.56,
        west: -75.58,
      },
    },
    keywords: [
      "avenida poblado",
      "av poblado",
      "el poblado",
      "poblado",
      "milla de oro",
      "parque lleras",
    ],
    peakHours: ["07:30-09:30", "17:30-19:30"],
    averageDelay: 20,
    priority: "high",
  },
  {
    id: "regional",
    name: "Avenida Regional",
    type: "highway",
    description: "Avenida Regional - Conecta el sur con el norte siguiendo el río Medellín",
    coordinates: {
      center: { lat: 6.2442, lng: -75.5945 },
      bounds: {
        north: 6.32,
        south: 6.17,
        east: -75.58,
        west: -75.61,
      },
    },
    keywords: [
      "regional",
      "avenida regional",
      "av regional",
      "paralela al rio",
    ],
    peakHours: ["06:30-09:00", "17:00-20:00"],
    averageDelay: 30,
    priority: "high",
  },
  {
    id: "las-palmas",
    name: "Vía Las Palmas",
    type: "highway",
    description: "Vía Las Palmas - Conexión con el oriente antioqueño, sector turístico",
    coordinates: {
      center: { lat: 6.1536, lng: -75.5234 },
      bounds: {
        north: 6.20,
        south: 6.10,
        east: -75.48,
        west: -75.56,
      },
    },
    keywords: [
      "las palmas",
      "vía las palmas",
      "via palmas",
      "variante",
    ],
    peakHours: ["17:00-20:00", "06:00-08:00"],
    averageDelay: 25,
    priority: "medium",
  },
]

/**
 * Find which critical zone(s) a location belongs to
 */
export function findCriticalZone(lat: number, lng: number): CriticalZone | null {
  for (const zone of CRITICAL_ZONES) {
    const { bounds } = zone.coordinates
    if (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    ) {
      return zone
    }
  }
  return null
}

/**
 * Find critical zone by text matching (for scraping)
 */
export function findCriticalZoneByText(text: string): CriticalZone | null {
  const lowerText = text.toLowerCase()

  for (const zone of CRITICAL_ZONES) {
    for (const keyword of zone.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return zone
      }
    }
  }

  return null
}

/**
 * Get all critical zones currently in peak hours
 */
export function getZonesInPeakHours(): CriticalZone[] {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour + currentMinute / 60

  return CRITICAL_ZONES.filter(zone => {
    return zone.peakHours.some(period => {
      const [start, end] = period.split('-')
      const [startHour, startMin] = start.split(':').map(Number)
      const [endHour, endMin] = end.split(':').map(Number)

      const startTime = startHour + startMin / 60
      const endTime = endHour + endMin / 60

      return currentTime >= startTime && currentTime <= endTime
    })
  })
}

/**
 * Calculate distance from a point to a zone's center (in km)
 */
export function distanceToZone(lat: number, lng: number, zone: CriticalZone): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((zone.coordinates.center.lat - lat) * Math.PI) / 180
  const dLon = ((zone.coordinates.center.lng - lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((zone.coordinates.center.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get zones sorted by priority
 */
export function getZonesByPriority(): CriticalZone[] {
  const priorityOrder = { critical: 3, high: 2, medium: 1 }
  return [...CRITICAL_ZONES].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
}
