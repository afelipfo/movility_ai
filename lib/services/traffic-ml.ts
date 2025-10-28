/**
 * Machine Learning Service for Traffic Prediction
 * Uses a lightweight ARIMA-based forecaster over synthetic historical data
 * to predict congestion levels 30-60 minutes ahead.
 *
 * NOTE: In production replace the synthetic generator with real telemetry.
 */

export type WeatherCondition = "sunny" | "rainy" | "cloudy"

export interface TrafficFeatures {
  dayOfWeek: number // 0-6
  hourOfDay: number // 0-23
  isHoliday?: boolean
  weatherCondition?: WeatherCondition
  historicalAverage?: number
  recentTrend?: number
}

export interface TrafficPredictionOptions {
  horizons?: number[] // minutes ahead
  intervalMinutes?: number
  baseTime?: Date
}

export interface TrafficPrediction {
  zone: string
  horizonMinutes: number
  predictedLevel: "low" | "medium" | "high" | "severe"
  confidence: number
  factors: string[]
  timestamp: string
  rawValue: number
}

export class TrafficMLService {
  /**
   * Predict traffic level for a single zone across the provided horizons.
   */
  async predictTraffic(
    zone: string,
    features: TrafficFeatures,
    options: TrafficPredictionOptions = {},
  ): Promise<TrafficPrediction[]> {
    const horizons = options.horizons ?? [30, 60]
    const intervalMinutes = options.intervalMinutes ?? 15
    const baseTime = options.baseTime ?? this.buildBaseTime(features)
    const workingFeatures: TrafficFeatures = { ...features }

    const series = await this.getHistoricalSeries(zone, baseTime, intervalMinutes, workingFeatures)
    const lastObserved = series[series.length - 1]

    const steps = Math.max(...horizons.map((h) => Math.max(1, Math.ceil(h / intervalMinutes))))
    const seasonality = Math.max(1, Math.round((24 * 60) / intervalMinutes)) // daily periodicity

    let forecastValues: number[] = []
    let errorEstimates: number[] = []

    try {
      const { default: ARIMA } = (await import("arima")) as any
      const model = new ARIMA({
        p: 2,
        d: 1,
        q: 2,
        P: 1,
        D: 0,
        Q: 1,
        s: seasonality,
        verbose: false,
      }).train(series)

      const [forecast, errors] = model.predict(steps)
      forecastValues = forecast
      errorEstimates = errors
    } catch (error) {
      console.error("[TrafficMLService] ARIMA forecast failed, falling back to seasonal average:", error)
      forecastValues = this.seasonalNaiveForecast(series, steps, seasonality)
      errorEstimates = new Array(forecastValues.length).fill(this.standardDeviation(series) * 0.3)
    }

    const predictions: TrafficPrediction[] = []

    for (const horizon of horizons) {
      const stepIndex = Math.max(0, Math.ceil(horizon / intervalMinutes) - 1)
      const rawValue = forecastValues[stepIndex] ?? lastObserved
      const adjustedValue = this.adjustForConditions(rawValue, workingFeatures)
      const confidence = this.computeConfidence(adjustedValue, errorEstimates[stepIndex], series)
      const timestamp = new Date(baseTime.getTime() + horizon * 60000)

      predictions.push({
        zone,
        horizonMinutes: horizon,
        predictedLevel: this.mapToLevel(adjustedValue),
        confidence,
        factors: this.buildFactors(adjustedValue, lastObserved, timestamp, workingFeatures),
        timestamp: timestamp.toISOString(),
        rawValue: adjustedValue,
      })
    }

    return predictions
  }

  /**
   * Predict traffic levels for multiple zones.
   */
  async predictMultipleZones(
    zones: string[],
    features: TrafficFeatures,
    options: TrafficPredictionOptions = {},
  ): Promise<TrafficPrediction[]> {
    const results = await Promise.all(zones.map((zone) => this.predictTraffic(zone, features, options)))
    return results.flat()
  }

  /**
   * Historical data retrieval placeholder. Generates deterministic synthetic
   * time-series data resembling congestion intensity (0-1 scale).
   */
  async getHistoricalSeries(
    zone: string,
    baseTime: Date,
    intervalMinutes: number,
    features: TrafficFeatures,
    totalDays: number = 14,
  ): Promise<number[]> {
    const pointsPerDay = Math.round((24 * 60) / intervalMinutes)
    const totalPoints = totalDays * pointsPerDay
    const data: number[] = []

    const seededRandom = this.seededRandom(zone)

    for (let index = totalPoints; index > 0; index--) {
      const minutesAgo = index * intervalMinutes
      const timestamp = new Date(baseTime.getTime() - minutesAgo * 60000)
      const hour = timestamp.getHours()
      const day = timestamp.getDay()

      let value = 0.2 // baseline low traffic

      // Daily rush hours
      if ((hour >= 6 && hour < 10) || (hour >= 16 && hour < 20)) {
        value += 0.5
      } else if (hour >= 11 && hour < 14) {
        value += 0.25
      }

      // Weekday vs weekend
      if (day === 0 || day === 6) {
        value *= 0.7
      } else {
        value += 0.05
      }

      // Zone-specific congestion multiplier
      value *= this.zoneCongestionFactor(zone)

      // Weather impact
      if (features.weatherCondition === "rainy") {
        value += 0.15
      } else if (features.weatherCondition === "cloudy") {
        value += 0.05
      }

      // Holiday impact
      if (features.isHoliday) {
        value *= 0.6
      }

      // Random noise (deterministic per zone)
      value += (seededRandom() - 0.5) * 0.1

      data.push(this.clamp(value))
    }

    features.historicalAverage = features.historicalAverage ?? this.average(data)
    features.recentTrend = features.recentTrend ?? this.computeRecentTrend(data)

    return data
  }

  /**
   * Train ML model placeholder (no-op in this lightweight implementation).
   */
  async trainModel(trainingData: number[]): Promise<boolean> {
    console.log("[TrafficMLService] Training with", trainingData.length, "samples (placeholder)")
    return true
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private seasonalNaiveForecast(series: number[], steps: number, seasonality: number): number[] {
    const forecast: number[] = []
    for (let i = 0; i < steps; i++) {
      const index = series.length - seasonality + (i % seasonality)
      const value = index >= 0 ? series[index] : series[series.length - 1]
      forecast.push(value)
    }
    return forecast
  }

  private adjustForConditions(value: number, features: TrafficFeatures): number {
    let adjusted = value

    if (features.recentTrend && features.recentTrend > 0.5) {
      adjusted += 0.05
    }

    if (features.isHoliday) {
      adjusted *= 0.7
    }

    return this.clamp(adjusted)
  }

  private computeConfidence(value: number, error: number | undefined, history: number[]): number {
    const baselineStd = this.standardDeviation(history)
    const normalizedError = error ? error / (value + 0.1) : baselineStd * 0.2
    const confidence = 0.95 - normalizedError
    return Math.max(0.6, Math.min(0.95, confidence))
  }

  private mapToLevel(value: number): "low" | "medium" | "high" | "severe" {
    if (value >= 0.85) return "severe"
    if (value >= 0.65) return "high"
    if (value >= 0.4) return "medium"
    return "low"
  }

  private buildFactors(
    predictedValue: number,
    lastObserved: number,
    timestamp: Date,
    features: TrafficFeatures,
  ): string[] {
    const factors = ["arima_forecast"]
    const hour = timestamp.getHours()

    if ((hour >= 6 && hour < 10) || (hour >= 16 && hour < 20)) {
      factors.push("peak_hour")
    }

    if (features.weatherCondition === "rainy") {
      factors.push("rainy_weather")
    }

    if (features.isHoliday) {
      factors.push("holiday_adjustment")
    }

    if (predictedValue > lastObserved) {
      factors.push("increasing_trend")
    } else if (predictedValue < lastObserved) {
      factors.push("decreasing_trend")
    }

    return factors
  }

  private computeRecentTrend(series: number[]): number {
    const window = Math.min(24, series.length)
    const recent = series.slice(series.length - window)
    const early = recent.slice(0, Math.floor(window / 2))
    const late = recent.slice(Math.floor(window / 2))

    const avgEarly = this.average(early)
    const avgLate = this.average(late)

    return avgLate - avgEarly
  }

  private zoneCongestionFactor(zone: string): number {
    const normalized = (this.hashString(zone) % 30) / 100
    return 1 + normalized // between 1.0 and 1.3
  }

  private seededRandom(zone: string): () => number {
    let seed = this.hashString(zone) || 1
    return () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
  }

  private hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  private standardDeviation(values: number[]): number {
    const avg = this.average(values)
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / Math.max(1, values.length - 1)
    return Math.sqrt(variance)
  }

  private clamp(value: number, min: number = 0, max: number = 1): number {
    return Math.min(max, Math.max(min, value))
  }

  private buildBaseTime(features: TrafficFeatures): Date {
    const base = new Date()
    if (typeof features.hourOfDay === "number") {
      base.setHours(features.hourOfDay, 0, 0, 0)
    }
    if (typeof features.dayOfWeek === "number") {
      const diff = features.dayOfWeek - base.getDay()
      base.setDate(base.getDate() + diff)
    }
    return base
  }
}
