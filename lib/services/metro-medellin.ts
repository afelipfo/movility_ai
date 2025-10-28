/**
 * Metro de Medellín API Integration
 * Handles metro schedules, stations, and real-time status
 */

export interface MetroStation {
  id: string
  name: string
  line: "A" | "B" | "K" | "L" | "M" | "T"
  lat: number
  lng: number
  connections: string[]
}

export interface MetroStatus {
  line: string
  status: "operational" | "delayed" | "closed"
  message?: string
  lastUpdate: string
}

export class MetroMedellinService {
  private stations: MetroStation[] = [
    // Line A (North-South)
    { id: "niquía", name: "Niquía", line: "A", lat: 6.3119, lng: -75.5636, connections: [] },
    { id: "bello", name: "Bello", line: "A", lat: 6.3008, lng: -75.5636, connections: [] },
    { id: "madera", name: "Madera", line: "A", lat: 6.2897, lng: -75.5636, connections: [] },
    { id: "acevedo", name: "Acevedo", line: "A", lat: 6.2786, lng: -75.5636, connections: ["K"] },
    { id: "tricentenario", name: "Tricentenario", line: "A", lat: 6.2675, lng: -75.5636, connections: [] },
    { id: "caribe", name: "Caribe", line: "A", lat: 6.2564, lng: -75.5636, connections: [] },
    { id: "universidad", name: "Universidad", line: "A", lat: 6.2453, lng: -75.5636, connections: [] },
    { id: "hospital", name: "Hospital", line: "A", lat: 6.2342, lng: -75.5636, connections: [] },
    { id: "prado", name: "Prado", line: "A", lat: 6.2231, lng: -75.5636, connections: [] },
    { id: "parque_berrio", name: "Parque Berrío", line: "A", lat: 6.252, lng: -75.5636, connections: ["B"] },
    { id: "san_antonio", name: "San Antonio", line: "A", lat: 6.2442, lng: -75.5812, connections: ["B"] },
    { id: "alpujarra", name: "Alpujarra", line: "A", lat: 6.2453, lng: -75.5812, connections: [] },
    { id: "exposiciones", name: "Exposiciones", line: "A", lat: 6.2342, lng: -75.5812, connections: [] },
    { id: "industriales", name: "Industriales", line: "A", lat: 6.2231, lng: -75.5812, connections: [] },
    { id: "poblado", name: "Poblado", line: "A", lat: 6.2088, lng: -75.5673, connections: [] },
    { id: "aguacatala", name: "Aguacatala", line: "A", lat: 6.1977, lng: -75.5673, connections: [] },
    { id: "ayura", name: "Ayura", line: "A", lat: 6.1866, lng: -75.5673, connections: [] },
    { id: "envigado", name: "Envigado", line: "A", lat: 6.1755, lng: -75.5673, connections: [] },
    { id: "itagui", name: "Itagüí", line: "A", lat: 6.1644, lng: -75.5673, connections: [] },
    { id: "sabaneta", name: "Sabaneta", line: "A", lat: 6.1533, lng: -75.5673, connections: [] },
    { id: "la_estrella", name: "La Estrella", line: "A", lat: 6.1422, lng: -75.5673, connections: [] },

    // Line B (West)
    { id: "san_javier", name: "San Javier", line: "B", lat: 6.2442, lng: -75.6123, connections: [] },
    { id: "santa_lucia", name: "Santa Lucía", line: "B", lat: 6.2442, lng: -75.6012, connections: [] },
    { id: "suramericana", name: "Suramericana", line: "B", lat: 6.2442, lng: -75.5901, connections: [] },
    { id: "estadio", name: "Estadio", line: "B", lat: 6.2442, lng: -75.579, connections: [] },
  ]

  /**
   * Get all metro stations
   */
  getStations(): MetroStation[] {
    return this.stations
  }

  /**
   * Find nearest metro station to coordinates
   */
  findNearestStation(lat: number, lng: number): MetroStation | null {
    let nearest: MetroStation | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const station of this.stations) {
      const distance = Math.sqrt(Math.pow(station.lat - lat, 2) + Math.pow(station.lng - lng, 2))
      if (distance < minDistance) {
        minDistance = distance
        nearest = station
      }
    }

    return nearest
  }

  /**
   * Get current status of all metro lines
   */
  async getStatus(): Promise<MetroStatus[]> {
    try {
      // In production, call Metro de Medellín API
      // For now, return mock status
      return [
        { line: "A", status: "operational", lastUpdate: new Date().toISOString() },
        { line: "B", status: "operational", lastUpdate: new Date().toISOString() },
        { line: "K", status: "operational", lastUpdate: new Date().toISOString() },
        { line: "L", status: "operational", lastUpdate: new Date().toISOString() },
        { line: "M", status: "operational", lastUpdate: new Date().toISOString() },
        { line: "T", status: "operational", lastUpdate: new Date().toISOString() },
      ]
    } catch (error) {
      console.error("[v0] Metro status error:", error)
      return []
    }
  }

  /**
   * Calculate route using metro
   */
  calculateMetroRoute(
    originStation: MetroStation,
    destinationStation: MetroStation,
  ): {
    stations: MetroStation[]
    duration: number
    transfers: number
  } | null {
    // Simple route calculation (in production, use proper graph algorithm)
    const stationsOnRoute: MetroStation[] = [originStation, destinationStation]
    const duration = Math.abs(this.stations.indexOf(originStation) - this.stations.indexOf(destinationStation)) * 3 // 3 min per station

    return {
      stations: stationsOnRoute,
      duration,
      transfers: originStation.line !== destinationStation.line ? 1 : 0,
    }
  }
}
