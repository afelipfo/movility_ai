import { logger } from "./logger"

export interface BasicLocation {
  lat: number
  lng: number
}

export interface GeocodeResult extends BasicLocation {
  formattedAddress: string
}

const GEOCODE_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

interface GoogleGeocodeResponse {
  status: string
  results: Array<{ formatted_address: string; geometry: { location: BasicLocation } }>
  error_message?: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    logger.warn("[Geocode] Missing Google Maps API key")
    return null
  }

  const url = new URL(GEOCODE_BASE_URL)
  url.searchParams.set("address", address)
  url.searchParams.set("key", apiKey)
  url.searchParams.set("region", "CO")

  const response = await fetch(url.toString())
  const data = (await response.json()) as GoogleGeocodeResponse

  if (data.status !== "OK" || data.results.length === 0) {
    logger.warn("[Geocode] Address not found", { address, status: data.status, error: data.error_message })
    return null
  }

  const match = data.results[0]
  return {
    lat: match.geometry.location.lat,
    lng: match.geometry.location.lng,
    formattedAddress: match.formatted_address,
  }
}

export async function reverseGeocode(location: BasicLocation): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    logger.warn("[ReverseGeocode] Missing Google Maps API key")
    return null
  }

  const url = new URL(GEOCODE_BASE_URL)
  url.searchParams.set("latlng", `${location.lat},${location.lng}`)
  url.searchParams.set("key", apiKey)
  url.searchParams.set("region", "CO")

  const response = await fetch(url.toString())
  const data = (await response.json()) as GoogleGeocodeResponse

  if (data.status !== "OK" || data.results.length === 0) {
    logger.warn("[ReverseGeocode] No address found", { location, status: data.status, error: data.error_message })
    return null
  }

  return data.results[0].formatted_address
}
