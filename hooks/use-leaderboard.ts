"use client"

import { useEffect, useState } from "react"

interface LeaderboardEntry {
  rank: number
  alias: string
  totalDistanceKm: number
  totalRoutes: number
}

interface LeaderboardResponse {
  success: boolean
  leaderboard: LeaderboardEntry[]
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/leaderboard")
        const raw = await response.text()

        if (!response.ok) {
          throw new Error(raw || "Error obteniendo leaderboard")
        }

        const parsed: LeaderboardResponse = JSON.parse(raw)
        if (isMounted) {
          setEntries(Array.isArray(parsed?.leaderboard) ? parsed.leaderboard : [])
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchLeaderboard()
    const interval = window.setInterval(fetchLeaderboard, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  return {
    entries,
    isLoading,
    error,
  }
}
