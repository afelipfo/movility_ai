"use client"

import { AlertTriangle, Construction, Calendar, Cloud } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TrafficAlert } from "@/lib/agents/types"

interface AlertsPanelProps {
  alerts: TrafficAlert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "accident":
        return <AlertTriangle className="h-4 w-4" />
      case "construction":
        return <Construction className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      case "weather":
        return <Cloud className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Alertas de Tráfico</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No hay alertas activas</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.description}</p>
                    {alert.location && <p className="text-xs text-muted-foreground">{alert.location.address}</p>}
                    <p className="text-xs text-muted-foreground">Fuente: {alert.source}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
