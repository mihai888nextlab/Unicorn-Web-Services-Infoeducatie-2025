"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CloudIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline"

interface StorageCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface StorageStats {
  totalBuckets: number
  totalSize: number
  totalSizeGB: number
  usedPercentage: number
  monthlyGrowth: number
  cost: number
  recentActivity: string
}

export function StorageCard({ id, title, size, onRemove }: StorageCardProps) {
  const [stats, setStats] = useState<StorageStats>({
    totalBuckets: 0,
    totalSize: 0,
    totalSizeGB: 0,
    usedPercentage: 0,
    monthlyGrowth: 0,
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorageStats()
  }, [])

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const buckets = await response.json()
        const totalSize = buckets.reduce((sum: number, bucket: any) => sum + (bucket.totalSize || 0), 0)
        const totalSizeGB = totalSize / (1024 * 1024 * 1024)
        const cost = totalSizeGB * 0.021 // $0.021/GB/month
        
        setStats({
          totalBuckets: buckets.length,
          totalSize,
          totalSizeGB: Math.round(totalSizeGB * 100) / 100,
          usedPercentage: Math.min((totalSizeGB / 5) * 100, 100), // Assuming 5GB limit
          monthlyGrowth: Math.round(Math.random() * 15), // Mock data
          cost: Math.round(cost * 100) / 100,
          recentActivity: buckets.length > 0 ? `Last upload: ${new Date().toLocaleDateString()}` : "No recent activity"
        })
      }
    } catch (error) {
      console.error("Error fetching storage stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/storage"
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
          <CloudIcon className="w-5 h-5 text-blue-600" />
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
                <div className="text-2xl font-bold text-blue-600">{stats.totalBuckets}</div>
                <div className="text-xs text-muted-foreground">Buckets</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">${stats.cost}</div>
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
              </div>
            </div>

            {size !== "small" && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>{stats.totalSizeGB} GB</span>
                  </div>
                  <Progress value={stats.usedPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                    +{stats.monthlyGrowth}% this month
                  </Badge>
                  <ArchiveBoxIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                </div>

                {size === "large" || size === "wide" ? (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    {stats.recentActivity}
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}