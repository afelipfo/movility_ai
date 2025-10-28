import { type NextRequest, NextResponse } from "next/server"
import { TrafficMLService } from "@/lib/services/traffic-ml"
import { createClient } from "@/lib/supabase/server"
import { CRITICAL_ZONES } from "@/lib/config/medellin-zones"

/**
 * API Route: POST /api/predictions/generate
 * Generate traffic predictions using ML and save to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const mlService = new TrafficMLService()

    // Get current time features
    const now = new Date()
    const features = {
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours(),
      isHoliday: now.getDay() === 0 || now.getDay() === 6,
      weatherCondition: "sunny" as const,
    }

    const zones = [
      "Autopista Norte",
      "Autopista Sur",
      "Avenida Oriental",
      "Avenida El Poblado",
      "Carrera 70 (Avenida 80)",
    ]

    const zoneLookup = new Map(CRITICAL_ZONES.map((zone) => [zone.name, zone.coordinates.center]))

    const predictions = await mlService.predictMultipleZones(zones, features, {
      baseTime: now,
      horizons: [30, 60],
      intervalMinutes: 15,
    })

    const predictionRecords = predictions.map((pred) => {
      const coordinates = zoneLookup.get(pred.zone) ?? { lat: 6.2442, lng: -75.5812 }

      return {
        zone_name: pred.zone,
        zone_lat: coordinates.lat,
        zone_lng: coordinates.lng,
        predicted_traffic_level: pred.predictedLevel,
        confidence_score: pred.confidence,
        prediction_for_time: pred.timestamp,
        prediction_window_minutes: pred.horizonMinutes,
        day_of_week: features.dayOfWeek,
        hour_of_day: features.hourOfDay,
        is_holiday: features.isHoliday ?? false,
        weather_condition: features.weatherCondition,
        model_version: "arima-v1",
      }
    })

    const { data, error } = await supabase.from("traffic_predictions").insert(predictionRecords).select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      message: `Generated ${data.length} traffic predictions`,
    })
  } catch (error) {
    console.error("[v0] Generate predictions API error:", error)
    return NextResponse.json({ error: "Failed to generate predictions", details: String(error) }, { status: 500 })
  }
}
