"use client"

import { useEffect, useRef, useState } from "react"
import type { RouteOption, TrafficAlert } from "@/lib/agents/types"
import { Loader2 } from "lucide-react"
import { useGoogleMaps } from "@/hooks/use-google-maps"

interface MapViewProps {
  selectedRoute: RouteOption | null
  alerts: TrafficAlert[]
}

// Declare Google Maps types
declare global {
  interface Window {
    google: any
  }
}

export function MapView({ selectedRoute, alerts }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoaded: isMapsLoaded, error: mapsError } = useGoogleMaps()

  useEffect(() => {
    if (mapsError) {
      setError(mapsError)
      setIsLoading(false)
    }
  }, [mapsError])

  useEffect(() => {
    if (!isMapsLoaded) {
      return
    }

    if (googleMapRef.current) {
      return
    }

    initializeMap()
  }, [isMapsLoaded])

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps || googleMapRef.current) return

    try {
      // Create map centered on Medellín
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 6.2442, lng: -75.5812 }, // Medellín center
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      })

      // Create directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      })

      googleMapRef.current = map
      directionsRendererRef.current = directionsRenderer

      setIsLoading(false)
      console.log("[MapView] Map initialized successfully")
    } catch (err) {
      console.error("[MapView] Error initializing map:", err)
      setError("Error al inicializar el mapa")
      setIsLoading(false)
    }
  }

  // Update map when route changes
  useEffect(() => {
    if (!selectedRoute || !isMapsLoaded) {
      return
    }

    if (!googleMapRef.current) {
      initializeMap()
    }

    if (!googleMapRef.current || !window.google?.maps) {
      return
    }

    console.log("[MapView] Updating map with route:", selectedRoute)

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      const origin = {
        lat: selectedRoute.origin.lat,
        lng: selectedRoute.origin.lng,
      }
      const destination = {
        lat: selectedRoute.destination.lat,
        lng: selectedRoute.destination.lng,
      }

      // Determine travel mode based on transport modes
      let travelMode = "DRIVING"
      if (selectedRoute.transportModes.includes("walk") || selectedRoute.transportModes.includes("walking")) {
        travelMode = "WALKING"
      } else if (selectedRoute.transportModes.includes("bike") || selectedRoute.transportModes.includes("bicycling")) {
        travelMode = "BICYCLING"
      } else if (
        selectedRoute.transportModes.includes("transit") ||
        selectedRoute.transportModes.includes("metro") ||
        selectedRoute.transportModes.includes("bus")
      ) {
        travelMode = "TRANSIT"
      }

      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin,
          destination,
          travelMode,
        },
        (result: any, status: any) => {
          if (status === "OK" && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result)
          } else {
            console.error("[MapView] Directions request failed:", status)
            showMarkersOnly(origin, destination)
          }
        },
      )

      // Add alert markers
      alerts.forEach((alert) => {
        if (alert.location?.lat && alert.location?.lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: alert.location.lat, lng: alert.location.lng },
            map: googleMapRef.current,
            title: alert.description,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: alert.severity === "critical" ? "#EF4444" : "#F59E0B",
              fillOpacity: 0.8,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="p-2"><strong>${alert.type}</strong><br/>${alert.description}</div>`,
          })

          marker.addListener("click", () => {
            infoWindow.open(googleMapRef.current, marker)
          })

          markersRef.current.push(marker)
        }
      })
    } catch (err) {
      console.error("[MapView] Error updating map:", err)
    }
  }, [selectedRoute, alerts, isMapsLoaded])

  const showMarkersOnly = (origin: any, destination: any) => {
    // Clear directions
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] })
    }

    // Add origin marker
    const originMarker = new window.google.maps.Marker({
      position: origin,
      map: googleMapRef.current,
      title: "Origen",
      label: "A",
    })

    // Add destination marker
    const destMarker = new window.google.maps.Marker({
      position: destination,
      map: googleMapRef.current,
      title: "Destino",
      label: "B",
    })

    markersRef.current.push(originMarker, destMarker)

    // Fit bounds to show both markers
    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(origin)
    bounds.extend(destination)
    googleMapRef.current.fitBounds(bounds)
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <p className="text-lg font-medium text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground">Verifica tu configuración de Google Maps API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}
