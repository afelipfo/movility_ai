import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get("placeId")

    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const sessionToken = searchParams.get("sessiontoken") ?? undefined

    const params = new URLSearchParams({
      place_id: placeId,
      language: "es",
      region: "CO",
      key: apiKey,
    })

    if (sessionToken) {
      params.set("sessiontoken", sessionToken)
    }

    const referer = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`, {
      headers: {
        "Accept-Language": "es",
        Referer: referer,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[Places] Details request failed:", response.status, text)
      return NextResponse.json({ error: "Place details request failed" }, { status: 502 })
    }

    const data = await response.json()

    if (data.status === "REQUEST_DENIED") {
      console.error("[Places] Details denied:", data.error_message)
      return NextResponse.json({ error: data.error_message || "Place details request denied" }, { status: 403 })
    }

    return NextResponse.json({
      result: data.result,
      status: data.status,
      error_message: data.error_message,
    })
  } catch (error) {
    console.error("[Places] Details handler error:", error)
    return NextResponse.json({ error: "Place details handler error" }, { status: 500 })
  }
}
