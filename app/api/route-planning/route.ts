import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { origin, destination, preferredModes = [] } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    const modes = preferredModes.length ? preferredModes : ["transit", "walk"]
    const buildRoute = (id: string, factor: number) => ({
      id,
      origin,
      destination,
      transportModes: modes,
      duration: Math.max(10, Math.round(22 * factor)),
      distance: Number((8.5 * factor).toFixed(1)),
      trafficLevel: factor > 1.1 ? "medium" : "low",
      steps: [],
      co2Emissions: Number((0.3 * factor).toFixed(2)),
      confidence: 0.75,
    })

    return NextResponse.json({
      success: true,
      data: {
        selectedRoute: buildRoute("route-primary", 1),
        alternativeRoutes: [buildRoute("route-alt-1", 1.1), buildRoute("route-alt-2", 0.92)],
        trafficAlerts: [],
        recommendations: [],
        finalResponse: "Ruta simulada generada.",
        confidence: 0.75,
        processingTime: 80,
      },
      errors: [],
      warnings: [],
    })
  } catch (error) {
    console.error("[mock] Route planning API error:", error)
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 })
  }
}
