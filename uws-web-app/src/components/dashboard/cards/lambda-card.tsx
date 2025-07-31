"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BoltIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon
} from "@heroicons/react/24/outline"

interface LambdaCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface LambdaStats {
  totalFunctions: number
  activeFunctions: number
  totalInvocations: number
  avgDuration: number
  successRate: number
  errorCount: number
  cost: number
  recentActivity: string
}

export function LambdaCard({ id, title, size, onRemove }: LambdaCardProps) {
  const [stats, setStats] = useState<LambdaStats>({
    totalFunctions: 0,
    activeFunctions: 0,
    totalInvocations: 0,
    avgDuration: 0,
    successRate: 0,
    errorCount: 0,
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLambdaStats()
  }, [])

  const fetchLambdaStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const functions = await response.json()
        const activeFunctions = functions.filter((f: any) => f.status === "active").length
        const totalInvocations = Math.floor(Math.random() * 50000) + 1000 // Mock data
        const cost = (totalInvocations / 1000000) * 0.2 + (totalInvocations * 0.0000166667) // $0.20 per 1M requests + $0.0000166667 per GB-second

        setStats({
          totalFunctions: functions.length,
          activeFunctions,
          totalInvocations,
          avgDuration: Math.floor(Math.random() * 500) + 100, // Mock data
          successRate: Math.floor(Math.random() * 10) + 90, // Mock data
          errorCount: Math.floor(Math.random() * 50), // Mock data
          cost: Math.round(cost * 100) / 100,
          recentActivity: functions.length > 0 ? `Last execution: ${new Date().toLocaleTimeString()}` : "No recent activity"
        })
      }
    } catch (error) {
      console.error("Error fetching lambda stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/lambda"
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-4 row-span-1"
  }

  const getSuccessRateColor = () => {
    if (stats.successRate >= 95) return "text-green-600"
    if (stats.successRate >= 90) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className={`${sizeClasses[size]} group hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenService}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">{stats.totalFunctions}</div>
                <div className="text-xs text-muted-foreground">Functions</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">${stats.cost}</div>
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
              </div>
            </div>

            {size !== "small" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className={`w-4 h-4 ${getSuccessRateColor()}`} />
                    <span className={`text-sm ${getSuccessRateColor()}`}>
                      {stats.successRate}% Success Rate
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {stats.avgDuration}ms avg
                  </Badge>
                </div>

                {(size === "large" || size === "wide") && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Invocations Today</span>
                        <div className="font-semibold text-blue-600">{stats.totalInvocations.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Active Functions</span>
                        <div className="font-semibold text-purple-600">{stats.activeFunctions}/{stats.totalFunctions}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={stats.errorCount > 10 ? "destructive" : "outline"} className="text-xs">
                        <FireIcon className="w-3 h-3 mr-1" />
                        {stats.errorCount} errors today
                      </Badge>
                      <BoltIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-2">
                      {stats.recentActivity}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}