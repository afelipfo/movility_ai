import { type NextRequest, NextResponse } from "next/server"
import { ScrapingOrchestrator } from "@/lib/scrapers/orchestrator"

/**
 * API Route: POST /api/scraping/run
 * Manually trigger scraping (in production, use cron job)
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting scraping job...")

    const orchestrator = new ScrapingOrchestrator()
    const result = await orchestrator.runAll()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Scraping complete: ${result.alerts} alerts, ${result.events} events saved`,
    })
  } catch (error) {
    console.error("[v0] Scraping API error:", error)
    return NextResponse.json({ error: "Scraping failed", details: String(error) }, { status: 500 })
  }
}
