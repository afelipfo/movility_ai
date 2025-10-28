import { NextResponse } from "next/server"
import { ScraperOrchestrator } from "@/lib/scrapers/orchestrator"

// This endpoint can be called by Vercel Cron Jobs
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting scheduled scraping job...")

    const orchestrator = new ScraperOrchestrator()
    const results = await orchestrator.runAll()

    console.log("[v0] Scraping job completed:", results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in cron scraping job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
