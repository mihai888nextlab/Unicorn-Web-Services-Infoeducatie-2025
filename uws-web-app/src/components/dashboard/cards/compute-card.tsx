"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CpuChipIcon, 
  ArrowTrendingUpIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ServerIcon
} from "@heroicons/react/24/outline"

interface ComputeCardProps {
  id: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  onRemove: (id: string) => void
}

interface ComputeStats {
  totalInstances: number
  runningInstances: number
  totalCpu: number
  totalMemory: number
  cpuUtilization: number
  memoryUtilization: number
  cost: number
  recentActivity: string
}

export function ComputeCard({ id, title, size, onRemove }: ComputeCardProps) {
  const [stats, setStats] = useState<ComputeStats>({
    totalInstances: 0,
    runningInstances: 0,
    totalCpu: 0,
    totalMemory: 0,
    cpuUtilization: 0,
    memoryUtilization: 0,
    cost: 0,
    recentActivity: "Loading..."
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComputeStats()
  }, [])

  const fetchComputeStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/instances`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const instances = await response.json()
        const runningInstances = instances.filter((i: any) => i.status === "running").length
        const totalCpu = instances.reduce((sum: number, i: any) => sum + (i.cpu || 1), 0)
        const totalMemory = instances.reduce((sum: number, i: any) => sum + (i.memory || 512), 0)
        const cost = instances.length * 0.012 * 24 * 30 // $0.012/hour * 24h * 30 days

        setStats({
          totalInstances: instances.length,
          runningInstances,
          totalCpu,
          totalMemory,
          cpuUtilization: Math.floor(Math.random() * 40) + 30, // Mock data
          memoryUtilization: Math.floor(Math.random() * 50) + 25, // Mock data
          cost: Math.round(cost * 100) / 100,
          recentActivity: instances.length > 0 ? `Last deployment: ${new Date().toLocaleTimeString()}` : "No recent activity"
        })
      }
    } catch (error) {
      console.error("Error fetching compute stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenService = () => {
    window.location.href = "/app/services/compute"
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-4 row-span-1"
  }

  const getStatusColor = () => {
    if (stats.runningInstances === stats.totalInstances) return "text-green-600"
    if (stats.runningInstances > 0) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className={`${sizeClasses[size]} group hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CpuChipIcon className="w-5 h-5 text-purple-600" />
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
                <div className="text-2xl font-bold text-purple-600">{stats.totalInstances}</div>
                <div className="text-xs text-muted-foreground">Instances</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">${stats.cost}</div>
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
              </div>
            </div>

            {size !== "small" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className={`w-4 h-4 ${getStatusColor()}`} />
                    <span className={`text-sm ${getStatusColor()}`}>
                      {stats.runningInstances}/{stats.totalInstances} Running
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ServerIcon className="w-3 h-3 mr-1" />
                    {stats.totalCpu} vCPU
                  </Badge>
                </div>

                {(size === "large" || size === "wide") && (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>CPU Utilization</span>
                          <span>{stats.cpuUtilization}%</span>
                        </div>
                        <Progress value={stats.cpuUtilization} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Memory Utilization</span>
                          <span>{stats.memoryUtilization}%</span>
                        </div>
                        <Progress value={stats.memoryUtilization} className="h-2" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>{stats.recentActivity}</span>
                      <span>{(stats.totalMemory / 1024).toFixed(1)} GB RAM</span>
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