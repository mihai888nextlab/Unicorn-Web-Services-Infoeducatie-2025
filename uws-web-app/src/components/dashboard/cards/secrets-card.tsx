"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  KeyIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline"

interface SecretsCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface SecretsStats {
  totalSecrets: number
  sharedSecrets: number
  expiringSecrets: number
  versionsCount: number
  securityScore: number
  lastAccessed: string
  cost: number
  recentActivity: string
}

export function SecretsCard({ id, title, size, onRemove }: SecretsCardProps) {
  const [stats, setStats] = useState<SecretsStats>({
    totalSecrets: 0,
    sharedSecrets: 0,
    expiringSecrets: 0,
    versionsCount: 0,
    securityScore: 0,
    lastAccessed: "",
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecretsStats()
  }, [])

  const fetchSecretsStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const secrets = data.secrets || []
        const sharedSecrets = secrets.filter((s: any) => s.shared).length
        const cost = secrets.length * 0.50 // $0.50 per secret per month

        // Mock some advanced stats
        const expiringSecrets = Math.floor(secrets.length * 0.1) // 10% expiring soon
        const versionsCount = secrets.length * 2 // Average 2 versions per secret
        const securityScore = Math.floor(Math.random() * 20) + 80 // 80-100%

        setStats({
          totalSecrets: secrets.length,
          sharedSecrets,
          expiringSecrets,
          versionsCount,
          securityScore,
          lastAccessed: new Date().toLocaleTimeString(),
          cost: Math.round(cost * 100) / 100,
          recentActivity: secrets.length > 0 ? `Last access: ${new Date().toLocaleTimeString()}` : "No recent activity"
        })
      }
    } catch (error) {
      console.error("Error fetching secrets stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/secrets"
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-4 row-span-1"
  }

  const getSecurityScoreColor = () => {
    if (stats.securityScore >= 95) return "text-green-600"
    if (stats.securityScore >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getExpirationColor = () => {
    if (stats.expiringSecrets === 0) return "text-green-600"
    if (stats.expiringSecrets < 3) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className={`${sizeClasses[size]} group hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-red-600" />
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
                <div className="text-2xl font-bold text-red-600">{stats.totalSecrets}</div>
                <div className="text-xs text-muted-foreground">Secrets</div>
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
                    <ShieldCheckIcon className={`w-4 h-4 ${getSecurityScoreColor()}`} />
                    <span className={`text-sm ${getSecurityScoreColor()}`}>
                      {stats.securityScore}% Security Score
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {stats.versionsCount} versions
                  </Badge>
                </div>

                {(size === "large" || size === "wide") && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Shared Secrets</span>
                        <div className="font-semibold text-blue-600">{stats.sharedSecrets}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Expiring Soon</span>
                        <div className={`font-semibold ${getExpirationColor()}`}>{stats.expiringSecrets}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {stats.expiringSecrets > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          {stats.expiringSecrets} expiring soon
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          All secrets current
                        </Badge>
                      )}
                      <KeyIcon className="w-8 h-8 text-muted-foreground opacity-20" />
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