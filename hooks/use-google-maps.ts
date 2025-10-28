"use client"

import { useEffect, useState } from "react"

const SCRIPT_ID = "google-maps-js"
const DEFAULT_LIBRARIES = "places"

interface UseGoogleMapsOptions {
  libraries?: string
}

let scriptLoadingPromise: Promise<void> | null = null

function loadGoogleMaps(apiKey: string, libraries: string) {
  if (typeof window === "undefined") return Promise.reject()

  if (window.google?.maps?.places) {
    return Promise.resolve()
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    const onLoad = () => {
      resolve()
    }

    const onError = (event: Event) => {
      console.error("[GoogleMaps] Script load error", event)
      reject(new Error("Error al cargar Google Maps"))
    }

    if (existingScript) {
      existingScript.addEventListener("load", onLoad, { once: true })
      existingScript.addEventListener("error", onError, { once: true })
      return
    }

    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}`
    script.async = true
    script.defer = true
    script.addEventListener("load", onLoad, { once: true })
    script.addEventListener("error", onError, { once: true })
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const libraries = options.libraries ?? DEFAULT_LIBRARIES

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (window.google?.maps?.places) {
      setIsLoaded(true)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError("Google Maps API key no configurada")
      return
    }

    loadGoogleMaps(apiKey, libraries)
      .then(() => {
        setIsLoaded(true)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar Google Maps")
      })
  }, [libraries])

  return { isLoaded, error }
}
