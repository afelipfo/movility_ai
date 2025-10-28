"use client"

import { Trophy, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLeaderboard } from "@/hooks/use-leaderboard"

export function Leaderboard() {
  const { entries, isLoading, error } = useLeaderboard()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Ranking de ahorro de tiempo
        </CardTitle>
        <p className="text-xs text-muted-foreground">Usuarios con más kilómetros planificados en la semana</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando leaderboard...
          </div>
        )}

        {error && <p className="text-sm text-destructive">No se pudo cargar el ranking.</p>}

        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.alias}
              className="flex items-center justify-between rounded-md border border-border/60 bg-card/60 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  #{entry.rank} • {entry.alias}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.totalRoutes} rutas planificadas
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {entry.totalDistanceKm.toFixed(1)} km
                </p>
                <p className="text-[11px] text-muted-foreground">distancia optimizada</p>
              </div>
            </div>
          ))}

          {!isLoading && entries.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay suficientes datos para el ranking.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )}
