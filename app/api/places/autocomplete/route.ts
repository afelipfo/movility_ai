import { NextResponse } from "next/server"

const DEFAULT_CENTER = { lat: 6.2442, lng: -75.5812 }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get("input")?.trim()

    if (!input) {
      return NextResponse.json({ predictions: [], status: "ZERO_RESULTS" })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const sessionToken = searchParams.get("sessiontoken") ?? undefined
    const lat = parseFloat(searchParams.get("lat") ?? "")
    const lng = parseFloat(searchParams.get("lng") ?? "")

    const center = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : DEFAULT_CENTER

    const params = new URLSearchParams({
      input,
      types: "address",
      language: "es",
      components: "country:co",
      key: apiKey,
      locationbias: `point:${center.lat},${center.lng}`,
    })

    if (sessionToken) {
      params.set("sessiontoken", sessionToken)
    }

    const referer = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`, {
      headers: {
        "Accept-Language": "es",
        Referer: referer,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[Places] Autocomplete request failed:", response.status, text)
      return NextResponse.json({ error: "Autocomplete request failed" }, { status: 502 })
    }

    const data = await response.json()

    if (data.status === "REQUEST_DENIED") {
      console.error("[Places] Autocomplete denied:", data.error_message)
      return NextResponse.json({ error: data.error_message || "Autocomplete request denied" }, { status: 403 })
    }

    return NextResponse.json({
      predictions: data.predictions ?? [],
      status: data.status,
      error_message: data.error_message,
    })
  } catch (error) {
    console.error("[Places] Autocomplete handler error:", error)
    return NextResponse.json({ error: "Autocomplete handler error" }, { status: 500 })
  }
}
