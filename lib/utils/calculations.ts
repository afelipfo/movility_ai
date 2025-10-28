/**
 * Utility functions for route calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimals
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Estimate CO2 emissions based on distance and transport modes
 */
export function estimateCO2Emissions(distance: number, modes: string[]): number {
  // CO2 emissions in kg per km
  const emissionFactors: Record<string, number> = {
    car: 0.12,
    bus: 0.05,
    metro: 0.02,
    bike: 0,
    walk: 0,
  }

  // Calculate average emission factor
  const avgFactor = modes.reduce((sum, mode) => sum + (emissionFactors[mode] || 0.05), 0) / modes.length

  return Math.round(distance * avgFactor * 100) / 100
}

/**
 * Calculate time saved compared to average route
 */
export function calculateTimeSaved(actualDuration: number, averageDuration: number): number {
  return Math.max(0, averageDuration - actualDuration)
}

/**
 * Calculate experience points based on route metrics
 */
export function calculateExperiencePoints(
  distance: number,
  timeSaved: number,
  co2Saved: number,
  usedRecommendation: boolean,
): number {
  let points = 0

  // Base points for completing a route
  points += 10

  // Distance bonus (1 point per km)
  points += Math.floor(distance)

  // Time saved bonus (1 point per 5 minutes)
  points += Math.floor(timeSaved / 5)

  // CO2 saved bonus (5 points per kg)
  points += Math.floor(co2Saved * 5)

  // Recommendation bonus
  if (usedRecommendation) {
    points += 20
  }

  return points
}

/**
 * Determine user level based on experience points
 */
export function calculateLevel(experiencePoints: number): number {
  // Level up every 100 XP
  return Math.floor(experiencePoints / 100) + 1
}
