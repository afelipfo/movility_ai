"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { RouteHistory } from "@/lib/types/database"

interface RouteHistoryChartProps {
  recentRoutes: RouteHistory[]
}

export function RouteHistoryChart({ recentRoutes }: RouteHistoryChartProps) {
  // Group routes by day
  const routesByDay = recentRoutes.reduce(
    (acc, route) => {
      const date = new Date(route.created_at).toLocaleDateString("es-CO", { weekday: "short" })
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(routesByDay).map(([day, count]) => ({
    day,
    routes: count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            routes: {
              label: "Rutas",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="routes" fill="var(--color-routes)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
