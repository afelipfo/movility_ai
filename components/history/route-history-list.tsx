"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Star, Trash2 } from "lucide-react"
import type { RouteHistory, SavedRoute } from "@/lib/types/database"

interface RouteHistoryListProps {
  routeHistory: RouteHistory[]
  savedRoutes: SavedRoute[]
}

export function RouteHistoryList({ routeHistory, savedRoutes }: RouteHistoryListProps) {
  const [activeTab, setActiveTab] = useState("history")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Historial de Rutas</h1>
            <p className="text-muted-foreground">Revisa tus rutas anteriores y favoritas</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="history">Historial ({routeHistory.length})</TabsTrigger>
              <TabsTrigger value="saved">Guardadas ({savedRoutes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-6 space-y-4">
              {routeHistory.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No hay rutas en tu historial</p>
                    <p className="text-sm text-muted-foreground">Comienza a planificar rutas para verlas aquí</p>
                  </CardContent>
                </Card>
              ) : (
                routeHistory.map((route) => (
                  <Card key={route.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{route.origin_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-destructive" />
                              <span className="font-medium">{route.destination_address}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(route.created_at).toLocaleDateString("es-CO")}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {route.transport_modes.map((mode, i) => (
                            <Badge key={i} variant="secondary">
                              {mode}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Duración</p>
                            <p className="font-medium">{route.actual_duration_minutes || 0} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Distancia</p>
                            <p className="font-medium">{route.actual_distance_km || 0} km</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CO2 Ahorrado</p>
                            <p className="font-medium text-accent">{route.co2_saved_kg} kg</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-6 space-y-4">
              {savedRoutes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No tienes rutas guardadas</p>
                    <p className="text-sm text-muted-foreground">Guarda tus rutas favoritas para acceso rápido</p>
                  </CardContent>
                </Card>
              ) : (
                savedRoutes.map((route) => (
                  <Card key={route.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{route.name}</h3>
                              {route.is_favorite && <Star className="h-4 w-4 fill-chart-4 text-chart-4" />}
                            </div>
                            {route.description && <p className="text-sm text-muted-foreground">{route.description}</p>}
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span>{route.origin_address}</span>
                              <span className="text-muted-foreground">→</span>
                              <MapPin className="h-3 w-3 text-destructive" />
                              <span>{route.destination_address}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {route.transport_modes.map((mode, i) => (
                              <Badge key={i} variant="secondary">
                                {mode}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Usada {route.use_count} veces</span>
                            <Button size="sm">Usar ruta</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
