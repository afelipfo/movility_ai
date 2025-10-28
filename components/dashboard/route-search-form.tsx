"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGoogleMaps } from "@/hooks/use-google-maps"

interface RouteSearchFormProps {
  onSearch: (data: {
    origin: { address: string; lat: number; lng: number }
    destination: { address: string; lat: number; lng: number }
    preferredModes: string[]
  }) => void
  isLoading: boolean
}

interface ResolvedLocation {
  address: string
  lat: number
  lng: number
}

declare global {
  interface Window {
    google: typeof google
  }
}

const DEFAULT_CENTER = { lat: 6.2442, lng: -75.5812 }

export function RouteSearchForm({ onSearch, isLoading }: RouteSearchFormProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [modes, setModes] = useState<string[]>(["metro", "bus", "walk"])
  const [formError, setFormError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { isLoaded, error: mapsError } = useGoogleMaps()

  const originInputRef = useRef<HTMLInputElement | null>(null)
  const destinationInputRef = useRef<HTMLInputElement | null>(null)
  const originLocationRef = useRef<ResolvedLocation | null>(null)
  const destinationLocationRef = useRef<ResolvedLocation | null>(null)
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const originListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const destinationListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.places) return

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }

    if (originInputRef.current && !originAutocompleteRef.current) {
      originAutocompleteRef.current = new window.google.maps.places.Autocomplete(originInputRef.current, {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "co" },
      })

      originListenerRef.current = originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current?.getPlace()
        if (!place) return
        const address = place.formatted_address || place.name || originInputRef.current?.value || ""
        setOrigin(address)
        if (place.geometry?.location) {
          originLocationRef.current = {
            address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
        }
      })
    }

    if (destinationInputRef.current && !destinationAutocompleteRef.current) {
      destinationAutocompleteRef.current = new window.google.maps.places.Autocomplete(destinationInputRef.current, {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "co" },
      })

      destinationListenerRef.current = destinationAutocompleteRef.current.addListener("place_changed", () => {
        const place = destinationAutocompleteRef.current?.getPlace()
        if (!place) return
        const address = place.formatted_address || place.name || destinationInputRef.current?.value || ""
        setDestination(address)
        if (place.geometry?.location) {
          destinationLocationRef.current = {
            address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
        }
      })
    }

    return () => {
      originListenerRef.current?.remove()
      destinationListenerRef.current?.remove()
    }
  }, [isLoaded])

  const ensureLocation = async (value: string, current: ResolvedLocation | null) => {
    if (!value.trim()) return null
    if (current && current.address === value) return current
    if (!geocoderRef.current) return null

    return new Promise<ResolvedLocation | null>((resolve) => {
      geocoderRef.current?.geocode(
        {
          address: value,
          componentRestrictions: { country: "CO" },
        },
        (results, status) => {
          if (status === "OK" && results && results[0]?.geometry?.location) {
            const result = results[0]
            resolve({
              address: result.formatted_address || value,
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            })
          } else {
            resolve(null)
          }
        },
      )
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!isLoaded || mapsError) {
      setFormError(mapsError ?? "Google Maps no está disponible. Intenta más tarde.")
      return
    }

    setIsValidating(true)

    const finalOrigin = await ensureLocation(origin, originLocationRef.current)
    if (!finalOrigin) {
      setIsValidating(false)
      setFormError("Selecciona un origen válido de Google o escribe una dirección completa.")
      return
    }

    const finalDestination = await ensureLocation(destination, destinationLocationRef.current)
    if (!finalDestination) {
      setIsValidating(false)
      setFormError("Selecciona un destino válido de Google o escribe una dirección completa.")
      return
    }

    originLocationRef.current = finalOrigin
    destinationLocationRef.current = finalDestination

    onSearch({
      origin: finalOrigin,
      destination: finalDestination,
      preferredModes: modes,
    })

    setIsValidating(false)
  }

  const toggleMode = (mode: string) => {
    setModes((prev) => (prev.includes(mode) ? prev.filter((item) => item !== mode) : [...prev, mode]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Planifica tu ruta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{formError}</p>}

          <div className="space-y-2">
            <Label htmlFor="origin">Origen</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={originInputRef}
                id="origin"
                placeholder="Ej: Parque Berrío"
                value={origin}
                onChange={(event) => {
                  setOrigin(event.target.value)
                  originLocationRef.current = null
                }}
                className="pl-10"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={destinationInputRef}
                id="destination"
                placeholder="Ej: El Poblado"
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value)
                  destinationLocationRef.current = null
                }}
                className="pl-10"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Modos de transporte</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "metro", label: "Metro" },
                { id: "bus", label: "Bus" },
                { id: "walk", label: "Caminar" },
                { id: "bike", label: "Bicicleta" },
              ].map((mode) => (
                <div key={mode.id} className="flex items-center space-x-2">
                  <Checkbox id={mode.id} checked={modes.includes(mode.id)} onCheckedChange={() => toggleMode(mode.id)} />
                  <Label htmlFor={mode.id} className="text-sm font-normal">
                    {mode.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isValidating || !!mapsError}>
            {isLoading || isValidating ? "Buscando..." : "Buscar ruta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
