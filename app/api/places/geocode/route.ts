import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")?.trim()

    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const params = new URLSearchParams({
      address,
      language: "es",
      region: "CO",
      key: apiKey,
    })

    const referer = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`, {
      headers: {
        "Accept-Language": "es",
        Referer: referer,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[Places] Geocode request failed:", response.status, text)
      return NextResponse.json({ error: "Geocode request failed" }, { status: 502 })
    }

    const data = await response.json()

    if (data.status === "REQUEST_DENIED") {
      console.error("[Places] Geocode denied:", data.error_message)
      return NextResponse.json({ error: data.error_message || "Geocode request denied" }, { status: 403 })
    }

    return NextResponse.json({
      results: data.results ?? [],
      status: data.status,
      error_message: data.error_message,
    })
  } catch (error) {
    console.error("[Places] Geocode handler error:", error)
    return NextResponse.json({ error: "Geocode handler error" }, { status: 500 })
  }
}
