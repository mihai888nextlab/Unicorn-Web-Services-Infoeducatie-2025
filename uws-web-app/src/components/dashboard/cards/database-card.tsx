"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CircleStackIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface DatabaseCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface DatabaseStats {
  totalDatabases: number
  postgresCount: number
  mongoCount: number
  healthyCount: number
  totalQueries: number
  avgResponseTime: number
  cost: number
  recentActivity: string
}

export function DatabaseCard({ id, title, size, onRemove }: DatabaseCardProps) {
  const [stats, setStats] = useState<DatabaseStats>({
    totalDatabases: 0,
    postgresCount: 0,
    mongoCount: 0,
    healthyCount: 0,
    totalQueries: 0,
    avgResponseTime: 0,
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      // Fetch PostgreSQL databases
      const postgresResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/databases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      // Fetch NoSQL databases
      const nosqlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      let postgresDBs = []
      let nosqlDBs = []

      if (postgresResponse.ok) {
        postgresDBs = await postgresResponse.json()
      }

      if (nosqlResponse.ok) {
        nosqlDBs = await nosqlResponse.json()
      }

      const totalDatabases = postgresDBs.length + nosqlDBs.length
      const healthyCount = totalDatabases // Assuming all are healthy for now
      const cost = totalDatabases * 15 // $15/month per database

      setStats({
        totalDatabases,
        postgresCount: postgresDBs.length,
        mongoCount: nosqlDBs.length,
        healthyCount,
        totalQueries: Math.floor(Math.random() * 10000) + 1000, // Mock data
        avgResponseTime: Math.floor(Math.random() * 50) + 10, // Mock data
        cost,
        recentActivity: totalDatabases > 0 ? `Last query: ${new Date().toLocaleTimeString()}` : "No recent activity"
      })
    } catch (error) {
      console.error("Error fetching database stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/database"
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-4 row-span-1"
  }

  return (
    <Card className={`${sizeClasses[size]} group hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CircleStackIcon className="w-5 h-5 text-green-600" />
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
                <div className="text-2xl font-bold text-green-600">{stats.totalDatabases}</div>
                <div className="text-xs text-muted-foreground">Databases</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">${stats.cost}</div>
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
              </div>
            </div>

            {size !== "small" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{stats.healthyCount}/{stats.totalDatabases} Healthy</span>
                  </div>
                  {stats.avgResponseTime && (
                    <Badge variant="outline" className="text-xs">
                      {stats.avgResponseTime}ms avg
                    </Badge>
                  )}
                </div>

                {(size === "large" || size === "wide") && (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>PostgreSQL: {stats.postgresCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>MongoDB: {stats.mongoCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>{stats.recentActivity}</span>
                      <span>{stats.totalQueries.toLocaleString()} queries today</span>
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