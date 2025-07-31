// Statistical utility functions for monitoring and billing

export interface DataPoint {
  timestamp: string
  value: number
}

export interface StatisticalSummary {
  min: number
  max: number
  sum: number
  avg: number
  p95: number
  count: number
}

export class Statistics {
  /**
   * Calculate comprehensive statistics for an array of numbers
   */
  static calculate(values: number[]): StatisticalSummary {
    if (values.length === 0) {
      return { min: 0, max: 0, sum: 0, avg: 0, p95: 0, count: 0 }
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length

    // Calculate 95th percentile
    const p95Index = Math.ceil(0.95 * values.length) - 1
    const p95 = sorted[Math.max(0, p95Index)]

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      sum,
      avg: Math.round(avg * 100) / 100, // Round to 2 decimal places
      p95,
      count: values.length
    }
  }

  /**
   * Calculate statistics from data points with timestamps
   */
  static calculateFromDataPoints(dataPoints: DataPoint[]): StatisticalSummary {
    const values = dataPoints.map(dp => dp.value)
    return this.calculate(values)
  }

  /**
   * Calculate hourly aggregates from data points
   */
  static aggregateByHour(dataPoints: DataPoint[]): { [hour: string]: StatisticalSummary } {
    const hourlyData: { [hour: string]: number[] } = {}

    dataPoints.forEach(dp => {
      const hour = new Date(dp.timestamp).toISOString().slice(0, 13) // YYYY-MM-DDTHH
      if (!hourlyData[hour]) {
        hourlyData[hour] = []
      }
      hourlyData[hour].push(dp.value)
    })

    const result: { [hour: string]: StatisticalSummary } = {}
    Object.keys(hourlyData).forEach(hour => {
      result[hour] = this.calculate(hourlyData[hour])
    })

    return result
  }

  /**
   * Calculate daily aggregates from data points
   */
  static aggregateByDay(dataPoints: DataPoint[]): { [day: string]: StatisticalSummary } {
    const dailyData: { [day: string]: number[] } = {}

    dataPoints.forEach(dp => {
      const day = new Date(dp.timestamp).toISOString().slice(0, 10) // YYYY-MM-DD
      if (!dailyData[day]) {
        dailyData[day] = []
      }
      dailyData[day].push(dp.value)
    })

    const result: { [day: string]: StatisticalSummary } = {}
    Object.keys(dailyData).forEach(day => {
      result[day] = this.calculate(dailyData[day])
    })

    return result
  }

  /**
   * Format number with appropriate units
   */
  static formatValue(value: number, unit: string): string {
    if (unit === 'Bytes') {
      return this.formatBytes(value)
    } else if (unit === 'Percent') {
      return `${Math.round(value * 100) / 100}%`
    } else if (unit === 'Count') {
      return Math.round(value).toLocaleString()
    } else if (unit === 'Seconds') {
      return `${Math.round(value * 100) / 100}s`
    } else if (unit === 'Milliseconds') {
      return `${Math.round(value)}ms`
    }
    return `${Math.round(value * 100) / 100} ${unit}`
  }

  /**
   * Format bytes with appropriate units
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  /**
   * Calculate cost based on usage and pricing model
   */
  static calculateCost(usage: number, pricingModel: {
    type: 'per_unit' | 'tiered' | 'free_tier'
    unit: string
    price?: number
    tiers?: { threshold: number; price: number }[]
    freeLimit?: number
  }): number {
    switch (pricingModel.type) {
      case 'per_unit':
        return usage * (pricingModel.price || 0)
      
      case 'free_tier':
        const freeLimit = pricingModel.freeLimit || 0
        const billableUsage = Math.max(0, usage - freeLimit)
        return billableUsage * (pricingModel.price || 0)
      
      case 'tiered':
        let cost = 0
        let remainingUsage = usage
        const tiers = pricingModel.tiers || []
        
        for (const tier of tiers) {
          if (remainingUsage <= 0) break
          
          const tierUsage = Math.min(remainingUsage, tier.threshold)
          cost += tierUsage * tier.price
          remainingUsage -= tierUsage
        }
        
        return cost
      
      default:
        return 0
    }
  }

  /**
   * Generate time series data for visualization
   */
  static generateTimeSeries(
    startTime: Date,
    endTime: Date,
    interval: 'minute' | 'hour' | 'day',
    baseValue: number,
    variance: number = 0.2
  ): DataPoint[] {
    const points: DataPoint[] = []
    const current = new Date(startTime)
    
    while (current <= endTime) {
      const randomFactor = 1 + (Math.random() - 0.5) * variance
      const value = Math.max(0, baseValue * randomFactor)
      
      points.push({
        timestamp: current.toISOString(),
        value: Math.round(value * 100) / 100
      })
      
      // Increment based on interval
      switch (interval) {
        case 'minute':
          current.setMinutes(current.getMinutes() + 1)
          break
        case 'hour':
          current.setHours(current.getHours() + 1)
          break
        case 'day':
          current.setDate(current.getDate() + 1)
          break
      }
    }
    
    return points
  }
}

export default Statistics