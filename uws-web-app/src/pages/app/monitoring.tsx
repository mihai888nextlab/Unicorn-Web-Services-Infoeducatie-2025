"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChartBarIcon,
  BellAlertIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { ResizableLayout } from "@/components/layout/resizable-layout"

// Types
interface Metric {
  namespace: string
  metricName: string
  unit: string
  dataPointCount?: number
}

interface MetricDatapoint {
  timestamp: string
  average?: number
  sum?: number
  maximum?: number
  minimum?: number
  sampleCount?: number
}

interface MetricStatistics {
  label: string
  datapoints: MetricDatapoint[]
}

interface Alarm {
  alarmName: string
  alarmDescription?: string
  metricName: string
  namespace: string
  comparisonOperator: string
  threshold: number
  stateValue: "OK" | "ALARM" | "INSUFFICIENT_DATA"
  stateReason?: string
  stateUpdatedTimestamp?: string
  period: number
  evaluationPeriods: number
  statistic: string
}

interface Dashboard {
  dashboardName: string
  dashboardArn?: string
  lastModified?: string
  size?: number
}

interface NotificationChannel {
  id: string
  name: string
  type: "EMAIL" | "WEBHOOK" | "SLACK" | "DISCORD" | "TELEGRAM"
  endpoint: string
  enabled: boolean
  createdAt: string
}

interface SystemStatus {
  status: string
  metrics: {
    total: number
    namespaces: string[]
  }
  alarms: {
    total: number
    byState: {
      OK: number
      ALARM: number
      INSUFFICIENT_DATA: number
    }
  }
  notificationChannels: {
    total: number
    enabled: number
  }
  recentActivity: Array<{
    type: string
    timestamp: string
    details: string
  }>
}

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  
  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<any[]>([])
  
  // Metrics
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)
  const [metricStatistics, setMetricStatistics] = useState<MetricStatistics | null>(null)
  const [metricTimeRange, setMetricTimeRange] = useState("24")
  
  // Alarms
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [alarmFilter, setAlarmFilter] = useState<string>("ALL")
  
  // Dashboards
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [textDashboard, setTextDashboard] = useState<string>("")
  
  // Notification channels
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([])
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  
  // Form states
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<string>("EMAIL")
  const [newChannelEndpoint, setNewChannelEndpoint] = useState("")

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/status`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error("Error fetching system status:", error)
    }
  }

  // Fetch system overview metrics
  const fetchSystemOverview = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/overview`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setSystemMetrics(data.systemMetrics || [])
      }
    } catch (error) {
      console.error("Error fetching system overview:", error)
    }
  }

  // Fetch metrics list
  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/metrics`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMetrics(data || [])
      }
    } catch (error) {
      console.error("Error fetching metrics:", error)
    }
  }

  // Fetch metric statistics
  const fetchMetricStatistics = async (metric: Metric) => {
    try {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - parseInt(metricTimeRange) * 60 * 60 * 1000)
      
      const params = new URLSearchParams({
        namespace: metric.namespace,
        metricName: metric.metricName,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        period: '300'
      })
      
      // Add multiple statistics parameters
      params.append('statistics[]', 'Average')
      params.append('statistics[]', 'Sum')
      params.append('statistics[]', 'Maximum')
      params.append('statistics[]', 'Minimum')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/metrics/statistics?${params}`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMetricStatistics(data)
      }
    } catch (error) {
      console.error("Error fetching metric statistics:", error)
    }
  }

  // Fetch alarms
  const fetchAlarms = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/alarms`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setAlarms(data || [])
      }
    } catch (error) {
      console.error("Error fetching alarms:", error)
    }
  }

  // Fetch dashboards
  const fetchDashboards = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/dashboards`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setDashboards(data || [])
      }
    } catch (error) {
      console.error("Error fetching dashboards:", error)
    }
  }

  // Fetch text dashboard (simulated from dashboards data)
  const fetchTextDashboard = async () => {
    try {
      const dashboards = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/dashboards`,
        { headers: getAuthHeaders() }
      ).then(r => r.json()).catch(() => [])
      
      if (dashboards.length > 0) {
        setTextDashboard(`Dashboard Summary\n${'-'.repeat(50)}\n${dashboards.map((d: any) => `• ${d.dashboardName}`).join('\n')}`)
      }
    } catch (error) {
      console.error("Error fetching text dashboard:", error)
    }
  }

  // Fetch notification channels
  const fetchNotificationChannels = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/notifications/channels`,
        {
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        setNotificationChannels(data || [])
      }
    } catch (error) {
      console.error("Error fetching notification channels:", error)
    }
  }

  // Create notification channel
  const createNotificationChannel = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/notifications/channels`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: newChannelName,
            type: newChannelType,
            endpoint: newChannelEndpoint,
            config: {},
          }),
        }
      )
      if (response.ok) {
        setShowCreateChannel(false)
        setNewChannelName("")
        setNewChannelEndpoint("")
        fetchNotificationChannels()
      }
    } catch (error) {
      console.error("Error creating notification channel:", error)
    }
  }

  // Delete alarm
  const deleteAlarm = async (alarmName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/alarms/${alarmName}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        fetchAlarms()
      }
    } catch (error) {
      console.error("Error deleting alarm:", error)
    }
  }

  // Test notification channel
  const testNotificationChannel = async (channelName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/notifications/test`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            channelName: channelName,
            message: "Test notification from monitoring dashboard"
          }),
        }
      )
      if (response.ok) {
        alert("Test notification sent successfully!")
      }
    } catch (error) {
      console.error("Error testing notification channel:", error)
    }
  }

  // Delete notification channel
  const deleteNotificationChannel = async (channelName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/notifications/channels/${channelName}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )
      if (response.ok) {
        fetchNotificationChannels()
      }
    } catch (error) {
      console.error("Error deleting notification channel:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSystemStatus(),
        fetchSystemOverview(),
        fetchMetrics(),
        fetchAlarms(),
        fetchDashboards(),
        fetchNotificationChannels(),
        fetchTextDashboard(),
      ])
      setLoading(false)
    }
    loadData()

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchSystemOverview()
      fetchAlarms()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedMetric) {
      fetchMetricStatistics(selectedMetric)
    }
  }, [selectedMetric, metricTimeRange])

  const getAlarmIcon = (state: string) => {
    switch (state) {
      case "OK":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case "ALARM":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case "INSUFFICIENT_DATA":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlarmBadgeVariant = (state: string) => {
    switch (state) {
      case "OK":
        return "secondary"
      case "ALARM":
        return "destructive"
      case "INSUFFICIENT_DATA":
        return "outline"
      default:
        return "secondary"
    }
  }

  const filteredAlarms = alarmFilter === "ALL" 
    ? alarms 
    : alarms.filter(alarm => alarm.stateValue === alarmFilter)

  return (
    <ResizableLayout currentPage="monitoring">
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchSystemStatus()
                fetchSystemOverview()
                fetchAlarms()
              }}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="alarms">Alarms</TabsTrigger>
                <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* System Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        System Status
                      </CardTitle>
                      <ServerIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold capitalize">
                        {systemStatus?.status || "Unknown"}
                      </div>
                      <Badge 
                        variant={systemStatus?.status === "operational" ? "secondary" : "outline"}
                        className="mt-2"
                      >
                        {systemStatus?.status === "operational" ? "All Systems Operational" : "Issues Detected"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Metrics
                      </CardTitle>
                      <ChartBarIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {systemStatus?.metrics.total || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Across {systemStatus?.metrics.namespaces.length || 0} namespaces
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Alarms
                      </CardTitle>
                      <BellAlertIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {systemStatus?.alarms.byState.ALARM || 0}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-green-600">
                          {systemStatus?.alarms.byState.OK || 0} OK
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-yellow-600">
                          {systemStatus?.alarms.byState.INSUFFICIENT_DATA || 0} Insufficient
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Notification Channels
                      </CardTitle>
                      <BoltIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {systemStatus?.notificationChannels.enabled || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Of {systemStatus?.notificationChannels.total || 0} total channels
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* System Metrics - Simple Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {systemMetrics.map((metric) => (
                    <Card key={metric.metricName}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{metric.metricName}</span>
                          <div className="flex items-center gap-2 text-sm font-normal">
                            <span className="text-2xl font-bold">
                              {metric.current?.toFixed(1)}%
                            </span>
                            {metric.trend && (
                              metric.trend > 0 ? (
                                <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                              ) : (
                                <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
                              )
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Latest datapoints:
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            {(metric.datapoints || []).slice(-4).map((dp: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="font-semibold">{dp.average?.toFixed(1) || 'N/A'}</div>
                                <div className="text-muted-foreground">
                                  {new Date(dp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                {systemStatus?.recentActivity && systemStatus.recentActivity.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {systemStatus.recentActivity.slice(0, 10).map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge variant="outline">{activity.type}</Badge>
                            <span>{activity.details}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metrics List */}
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Available Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {metrics.map((metric) => (
                          <button
                            key={`${metric.namespace}-${metric.metricName}`}
                            onClick={() => setSelectedMetric(metric)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedMetric?.metricName === metric.metricName
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="font-medium">{metric.metricName}</div>
                            <div className="text-xs opacity-80">
                              {metric.namespace} • {metric.unit}
                            </div>
                            {metric.dataPointCount && (
                              <div className="text-xs opacity-60 mt-1">
                                {metric.dataPointCount} data points
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metric Details */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {selectedMetric ? selectedMetric.metricName : "Select a Metric"}
                        </CardTitle>
                        {selectedMetric && (
                          <Select value={metricTimeRange} onValueChange={setMetricTimeRange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Last Hour</SelectItem>
                              <SelectItem value="6">Last 6 Hours</SelectItem>
                              <SelectItem value="24">Last 24 Hours</SelectItem>
                              <SelectItem value="168">Last Week</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {metricStatistics && metricStatistics.datapoints.length > 0 ? (
                        <div className="space-y-4">
                          {/* Statistics Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-2 text-left text-sm font-medium">Time</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium">Average</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium">Maximum</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium">Minimum</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium">Sum</th>
                                </tr>
                              </thead>
                              <tbody>
                                {metricStatistics.datapoints.slice(-10).reverse().map((dp, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="px-4 py-2 text-sm">
                                      {new Date(dp.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                      {dp.average?.toFixed(2) || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                      {dp.maximum?.toFixed(2) || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                      {dp.minimum?.toFixed(2) || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                      {dp.sum?.toFixed(2) || 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Statistics Summary */}
                          <div className="grid grid-cols-4 gap-4">
                            {["average", "maximum", "minimum", "sum"].map((stat) => {
                              const lastDatapoint = metricStatistics.datapoints[metricStatistics.datapoints.length - 1]
                              const value = lastDatapoint[stat as keyof MetricDatapoint] as number
                              return (
                                <div key={stat} className="text-center">
                                  <div className="text-sm text-muted-foreground">{stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                                  <div className="text-2xl font-bold">
                                    {value ? value.toFixed(2) : "N/A"}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                          {selectedMetric ? "No data available for this metric" : "Select a metric to view details"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alarms" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Monitoring Alarms</h2>
                    <Select value={alarmFilter} onValueChange={setAlarmFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All States</SelectItem>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="ALARM">In Alarm</SelectItem>
                        <SelectItem value="INSUFFICIENT_DATA">Insufficient Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Alarm
                  </Button>
                </div>

                <div className="grid gap-4">
                  {filteredAlarms.map((alarm) => (
                    <Card key={alarm.alarmName}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {getAlarmIcon(alarm.stateValue)}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{alarm.alarmName}</h3>
                                <Badge variant={getAlarmBadgeVariant(alarm.stateValue) as "default" | "destructive" | "outline" | "secondary"}>
                                  {alarm.stateValue}
                                </Badge>
                              </div>
                              {alarm.alarmDescription && (
                                <p className="text-sm text-muted-foreground">
                                  {alarm.alarmDescription}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{alarm.metricName}</span>
                                <span>•</span>
                                <span>{alarm.comparisonOperator.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span>•</span>
                                <span>Threshold: {alarm.threshold}</span>
                              </div>
                              {alarm.stateReason && (
                                <p className="text-sm mt-2">{alarm.stateReason}</p>
                              )}
                              {alarm.stateUpdatedTimestamp && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Last updated: {new Date(alarm.stateUpdatedTimestamp).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlarm(alarm.alarmName)}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredAlarms.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <BellAlertIcon className="w-12 h-12 mb-4" />
                        <p>No alarms found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dashboards" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Dashboards</h2>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Dashboard
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dashboards.map((dashboard) => (
                    <Card key={dashboard.dashboardName}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{dashboard.dashboardName}</h3>
                            {dashboard.lastModified && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Last modified: {new Date(dashboard.lastModified).toLocaleString()}
                              </p>
                            )}
                            {dashboard.size && (
                              <p className="text-sm text-muted-foreground">
                                Size: {(dashboard.size / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Text Dashboard */}
                {textDashboard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre">
                        {textDashboard}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Notification Channels</h2>
                  <Button onClick={() => setShowCreateChannel(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Channel
                  </Button>
                </div>

                <div className="grid gap-4">
                  {notificationChannels.map((channel) => (
                    <Card key={channel.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              channel.enabled ? "bg-green-500" : "bg-gray-400"
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{channel.name}</h3>
                                <Badge variant="outline">{channel.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {channel.endpoint}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created: {new Date(channel.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testNotificationChannel(channel.name)}
                            >
                              Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationChannel(channel.name)}
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {notificationChannels.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <BoltIcon className="w-12 h-12 mb-4" />
                        <p>No notification channels configured</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Create Notification Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notification Channel</DialogTitle>
            <DialogDescription>
              Add a new channel to receive monitoring alerts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., dev-alerts"
              />
            </div>

            <div>
              <Label htmlFor="channel-type">Type</Label>
              <Select value={newChannelType} onValueChange={setNewChannelType}>
                <SelectTrigger id="channel-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WEBHOOK">Webhook</SelectItem>
                  <SelectItem value="SLACK">Slack</SelectItem>
                  <SelectItem value="DISCORD">Discord</SelectItem>
                  <SelectItem value="TELEGRAM">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="channel-endpoint">Endpoint</Label>
              <Input
                id="channel-endpoint"
                value={newChannelEndpoint}
                onChange={(e) => setNewChannelEndpoint(e.target.value)}
                placeholder={
                  newChannelType === "EMAIL" ? "email@example.com" : 
                  newChannelType === "WEBHOOK" ? "https://example.com/webhook" :
                  "Channel endpoint"
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChannel(false)}>
              Cancel
            </Button>
            <Button onClick={createNotificationChannel}>
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResizableLayout>
  )
}