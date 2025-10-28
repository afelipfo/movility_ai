"use client"

import { Lightbulb, Clock, Leaf, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Recommendation } from "@/lib/agents/types"

interface RecommendationsPanelProps {
  recommendations: Recommendation[]
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "time":
        return <Clock className="h-4 w-4" />
      case "mode":
        return <Leaf className="h-4 w-4" />
      case "alert":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recomendaciones de IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 5).map((rec) => (
          <div key={rec.id} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {getIcon(rec.type)}
                <span className="text-sm font-medium">{rec.title}</span>
              </div>
              <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                {rec.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{rec.description}</p>
            {(rec.potentialTimeSaved || rec.potentialCO2Saved) && (
              <div className="flex gap-3 text-xs">
                {rec.potentialTimeSaved && <span className="text-primary">⏱️ Ahorra {rec.potentialTimeSaved} min</span>}
                {rec.potentialCO2Saved && <span className="text-accent">🌱 Reduce {rec.potentialCO2Saved} kg CO2</span>}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
