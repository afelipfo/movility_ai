"use client"

import { Clock, MapPin, DollarSign, Leaf } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RouteOption } from "@/lib/agents/types"

interface RouteResultsProps {
  selectedRoute: RouteOption
  alternativeRoutes: RouteOption[]
  onSelectRoute: (route: RouteOption) => void
}

export function RouteResults({ selectedRoute, alternativeRoutes, onSelectRoute }: RouteResultsProps) {
  return (
    <div className="space-y-4">
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ruta Recomendada</CardTitle>
            <Badge variant="default">Mejor opción</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RouteCard route={selectedRoute} />
        </CardContent>
      </Card>

      {alternativeRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rutas Alternativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alternativeRoutes.slice(0, 3).map((route) => (
              <div
                key={route.id}
                className="cursor-pointer rounded-lg border border-border p-3 hover:bg-accent"
                onClick={() => onSelectRoute(route)}
              >
                <RouteCard route={route} compact />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function RouteCard({ route, compact = false }: { route: RouteOption; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {route.transportModes.map((mode, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {mode}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{route.duration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{route.distance} km</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">${route.estimatedCost?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-accent" />
          <span className="font-medium">{route.co2Emissions} kg CO2</span>
        </div>
      </div>

      {!compact && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">Pasos de la ruta:</p>
          {route.steps.slice(0, 3).map((step, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-muted-foreground">{i + 1}.</span>
              <span>{step.instruction}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
