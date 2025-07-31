"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  QueueListIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from "@heroicons/react/24/outline"

interface QueueCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface QueueStats {
  totalQueues: number
  totalMessages: number
  pendingMessages: number
  processedToday: number
  avgProcessingTime: number
  dlqMessages: number
  cost: number
  recentActivity: string
}

export function QueueCard({ id, title, size, onRemove }: QueueCardProps) {
  const [stats, setStats] = useState<QueueStats>({
    totalQueues: 0,
    totalMessages: 0,
    pendingMessages: 0,
    processedToday: 0,
    avgProcessingTime: 0,
    dlqMessages: 0,
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueueStats()
  }, [])

  const fetchQueueStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/queue/configurations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const queues = await response.json()
        const totalMessages = queues.reduce((sum: number, q: any) => 
          sum + (q.approximateNumberOfMessages || 0), 0
        )
        const processedToday = Math.floor(Math.random() * 5000) + 500 // Mock data

        setStats({
          totalQueues: queues.length,
          totalMessages,
          pendingMessages: Math.floor(totalMessages * 0.3), // Mock data
          processedToday,
          avgProcessingTime: Math.floor(Math.random() * 200) + 50, // Mock data
          dlqMessages: Math.floor(Math.random() * 10), // Mock data
          cost: processedToday < 1000000 ? 0 : (processedToday - 1000000) * 0.0000005, // Free tier 1M requests, then $0.50 per million
          recentActivity: queues.length > 0 ? `Last message: ${new Date().toLocaleTimeString()}` : "No recent activity"
        })
      }
    } catch (error) {
      console.error("Error fetching queue stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/queue"
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-4 row-span-1"
  }

  const getMessageStatusColor = () => {
    if (stats.pendingMessages === 0) return "text-green-600"
    if (stats.pendingMessages < 100) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className={`${sizeClasses[size]} group hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <QueueListIcon className="w-5 h-5 text-yellow-600" />
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
                <div className="text-2xl font-bold text-yellow-600">{stats.totalQueues}</div>
                <div className="text-xs text-muted-foreground">Queues</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {stats.cost === 0 ? "FREE" : `$${stats.cost.toFixed(2)}`}
                </div>
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
              </div>
            </div>

            {size !== "small" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className={`w-4 h-4 ${getMessageStatusColor()}`} />
                    <span className={`text-sm ${getMessageStatusColor()}`}>
                      {stats.pendingMessages} Pending
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {stats.avgProcessingTime}ms avg
                  </Badge>
                </div>

                {(size === "large" || size === "wide") && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Processed Today</span>
                        <div className="font-semibold text-blue-600">{stats.processedToday.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Total Messages</span>
                        <div className="font-semibold text-purple-600">{stats.totalMessages.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {stats.dlqMessages > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          {stats.dlqMessages} in DLQ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          No failed messages
                        </Badge>
                      )}
                      <QueueListIcon className="w-8 h-8 text-muted-foreground opacity-20" />
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