"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, CpuChipIcon, TrashIcon, StopIcon, ArrowPathIcon, ExclamationTriangleIcon, PlayIcon } from "@heroicons/react/24/outline"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ResizableLayout } from "@/components/layout/resizable-layout"
import { useAuth } from "@/hooks/useAuth"

interface ComputeService {
  id: string
  name: string
  displayName: string
  description: string
  dockerImage: string
  size: string
  status: string
  instanceCount: number
  runningInstances: number
  url: string
  createdAt: string
  config: {
    cpu: number
    memory: number
    price: number
  }
}

interface InstanceSize {
  size: string
  cpu: number
  memory: number
  price: number
}

const INSTANCE_SIZES: InstanceSize[] = [
  { size: "micro", cpu: 0.5, memory: 512, price: 0.05 },
  { size: "small", cpu: 1, memory: 1024, price: 0.10 },
  { size: "medium", cpu: 2, memory: 2048, price: 0.20 },
  { size: "large", cpu: 4, memory: 4096, price: 0.40 },
  { size: "xlarge", cpu: 8, memory: 8192, price: 0.80 },
]

// Separate component for logs to prevent re-renders
const LogsSection = memo(({ serviceId, showModal }: { serviceId: string; showModal: boolean }) => {
  const [logs, setLogs] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      if (!loading && logs === null) {
        setLoading(true)
      }
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services/${serviceId}/logs?tail=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (err) {
      console.error("Error fetching logs:", err)
    } finally {
      setLoading(false)
    }
  }, [serviceId, loading, logs])

  useEffect(() => {
    if (showModal) {
      fetchLogs()
      const interval = setInterval(fetchLogs, 3000)
      return () => clearInterval(interval)
    }
  }, [showModal, fetchLogs])

  return (
    <div className="space-y-2 overflow-hidden flex flex-col h-full">
      <Label>Instance Logs</Label>
      <div className="bg-black text-white p-4 rounded-lg overflow-y-auto font-mono text-sm flex-1">
        {loading && !logs ? (
          <div className="text-center">
            <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading logs...
          </div>
        ) : logs ? (
          <div>
            {logs.instances?.map((instance: any, idx: number) => (
              <div key={idx} className="mb-4">
                <div className="text-green-400 mb-2">
                  Instance: {instance.instanceId || instance.containerName} ({instance.status})
                </div>
                <pre className="whitespace-pre-wrap">{instance.logs || "No logs available"}</pre>
                {instance.error && (
                  <div className="text-red-400 mt-2">Error: {instance.error}</div>
                )}
              </div>
            )) || (
              <pre className="whitespace-pre-wrap">{JSON.stringify(logs, null, 2)}</pre>
            )}
          </div>
        ) : (
          <div className="text-gray-400">No logs available</div>
        )}
      </div>
    </div>
  )
})

LogsSection.displayName = 'LogsSection'

export default function ComputePage() {
  const { user } = useAuth()
  const [services, setServices] = useState<ComputeService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal state
  const [selectedService, setSelectedService] = useState<ComputeService | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [serviceLogs, setServiceLogs] = useState<any>(null)
  const [logsLoading, setLogsLoading] = useState(false)
  
  // Form state
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDockerImage, setNewDockerImage] = useState("")
  const [newPort, setNewPort] = useState(3000)
  const [newSize, setNewSize] = useState("micro")
  const [newInstanceCount, setNewInstanceCount] = useState(1)
  const [newAutoScale, setNewAutoScale] = useState(false)
  const [newMinInstances, setNewMinInstances] = useState(1)
  const [newMaxInstances, setNewMaxInstances] = useState(5)
  const [newHealthCheckPath, setNewHealthCheckPath] = useState("/health")

  // Fetch logs for a service
  const fetchServiceLogs = useCallback(async (serviceId: string, showLoading = true) => {
    try {
      // Only show loading on initial fetch, not on updates
      if (showLoading && serviceLogs === null) {
        setLogsLoading(true)
      }
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services/${serviceId}/logs?tail=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setServiceLogs(data)
      } else {
        console.error("Failed to fetch logs")
        if (showLoading) {
          setServiceLogs(null)
        }
      }
    } catch (err) {
      console.error("Error fetching logs:", err)
      if (showLoading) {
        setServiceLogs(null)
      }
    } finally {
      if (showLoading && serviceLogs === null) {
        setLogsLoading(false)
      }
    }
  }, [serviceLogs])

  // Fetch services with optional loading state
  const fetchServices = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("Services API response:", data)
        setServices(Array.isArray(data) ? data : [])
      } else {
        console.error(`Compute API returned status: ${response.status}`)
        setServices([])
        if (response.status === 500) {
          setError("Compute service is currently unavailable. Please try again later.")
        } else if (response.status === 404) {
          // No services found is not an error
        } else {
          setError(`Failed to fetch services: ${response.status}`)
        }
      }
    } catch (err) {
      console.error("Error fetching services:", err)
      setServices([])
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Create new service
  const createService = async () => {
    if (!newName.trim() || !newDockerImage.trim()) {
      setCreateError("Name and Docker image are required")
      return
    }

    // Validate service name format
    const nameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
    if (!nameRegex.test(newName.trim())) {
      setCreateError("Service name must start and end with alphanumeric characters and can contain hyphens")
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setCreateError("No authentication token found")
        return
      }

      const requestBody = {
        name: newName.trim(),
        description: newDescription.trim(),
        dockerImage: newDockerImage.trim(),
        port: newPort,
        envVars: {},
        size: newSize,
        instanceCount: newInstanceCount,
        autoScale: newAutoScale,
        ...(newAutoScale && {
          minInstances: newMinInstances,
          maxInstances: newMaxInstances,
        }),
        healthCheckPath: newHealthCheckPath,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || `Failed to create service: ${response.status}`)
      }

      // Reset form and close modal
      setNewName("")
      setNewDescription("")
      setNewDockerImage("")
      setNewPort(3000)
      setNewSize("micro")
      setNewInstanceCount(1)
      setNewAutoScale(false)
      setNewMinInstances(1)
      setNewMaxInstances(5)
      setNewHealthCheckPath("/health")
      setAdding(false)

      // Refresh services
      await fetchServices()
    } catch (err) {
      console.error("Error creating service:", err)
      setCreateError(err instanceof Error ? err.message : "Failed to create service")
    } finally {
      setCreateLoading(false)
    }
  }

  // Service actions
  const handleServiceAction = async (serviceId: string, action: "stop" | "restart" | "delete") => {
    try {
      setActionLoading(`${serviceId}-${action}`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services/${serviceId}`
      let method = "POST"
      let body = undefined
      
      switch (action) {
        case "stop":
          url += "/stop"
          // Add empty body for POST requests
          body = JSON.stringify({})
          break
        case "restart":
          url += "/restart"
          // Add empty body for POST requests
          body = JSON.stringify({})
          break
        case "delete":
          method = "DELETE"
          break
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body && { body }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Error performing ${action}:`, errorData)
        throw new Error(errorData.message || errorData.detail || `Failed to ${action} service`)
      }

      // Log successful action
      const responseData = await response.json().catch(() => ({}))
      console.log(`${action} action successful:`, responseData)

      // For restart action, update the service status optimistically
      if (action === "restart") {
        setServices(prev => prev.map(s => 
          s.id === serviceId 
            ? { ...s, status: "starting" } 
            : s
        ))
        
        // Multiple refresh attempts to catch status changes
        // Refresh after 1s, 3s, and 5s to ensure we catch the status update
        setTimeout(() => fetchServices(false), 1000)
        setTimeout(() => fetchServices(false), 3000)
        setTimeout(() => fetchServices(false), 5000)
      } else if (action === "stop") {
        // For stop action, update status optimistically
        setServices(prev => prev.map(s => 
          s.id === serviceId 
            ? { ...s, status: "stopping" } 
            : s
        ))
        
        // Refresh after a short delay
        setTimeout(() => fetchServices(false), 1000)
      } else {
        // For other actions, refresh immediately
        await fetchServices(false)
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err)
      setError(err instanceof Error ? err.message : `Failed to ${action} service`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Scale service
  const handleScaleService = async (serviceId: string, newInstanceCount: number) => {
    try {
      setActionLoading(`${serviceId}-scale`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compute/services/${serviceId}/scale`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instanceCount: newInstanceCount }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to scale service")
      }

      await fetchServices()
    } catch (err) {
      console.error("Error scaling service:", err)
      setError(err instanceof Error ? err.message : "Failed to scale service")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchServices() // Initial load with loading state
      
      // Set up polling for service status updates
      const interval = setInterval(() => {
        fetchServices(false) // Subsequent updates without loading state
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [user])

  // Update selected service when services list changes
  useEffect(() => {
    if (selectedService && services.length > 0) {
      const updatedService = services.find(s => s.id === selectedService.id)
      if (updatedService) {
        setSelectedService(updatedService)
      }
    }
  }, [services, selectedService])

  // Auto-refresh logs when modal is open
  useEffect(() => {
    if (showDetailsModal && selectedService) {
      // Fetch logs immediately with loading indicator
      fetchServiceLogs(selectedService.id, true)
      
      // Set up polling for logs without loading indicator
      const logsInterval = setInterval(() => {
        fetchServiceLogs(selectedService.id, false)
      }, 3000) // Refresh logs every 3 seconds
      
      return () => clearInterval(logsInterval)
    }
  }, [showDetailsModal, selectedService?.id, fetchServiceLogs])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
      case "healthy":
        return "bg-green-400"
      case "pending":
      case "starting":
      case "restarting":
        return "bg-yellow-400 animate-pulse"
      case "stopping":
        return "bg-orange-400 animate-pulse"
      case "stopped":
        return "bg-gray-400"
      case "error":
      case "unhealthy":
      case "failed":
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  const getSelectedSize = () => {
    return INSTANCE_SIZES.find(s => s.size === newSize)
  }

  // Open service details modal
  const openServiceDetails = (service: ComputeService) => {
    setSelectedService(service)
    setShowDetailsModal(true)
    setServiceLogs(null)
    fetchServiceLogs(service.id)
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Compute Services</h1>
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <PlusIcon className="w-4 h-4 mr-1" /> New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogTitle>Deploy New Compute Service</DialogTitle>
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <Label htmlFor="name">Service Name*</Label>
                  <Input 
                    id="name"
                    placeholder="my-service" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value.toLowerCase())} 
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must start and end with alphanumeric, can contain hyphens
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Service description" 
                    value={newDescription} 
                    onChange={e => setNewDescription(e.target.value)} 
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Docker Image*</Label>
                  <Input 
                    id="image"
                    placeholder="e.g. nginx:latest, node:20-alpine" 
                    value={newDockerImage} 
                    onChange={e => setNewDockerImage(e.target.value)} 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input 
                    id="port"
                    type="number"
                    min={1}
                    max={65535}
                    placeholder="3000" 
                    value={newPort} 
                    onChange={e => setNewPort(parseInt(e.target.value) || 3000)} 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size">Instance Size</Label>
                  <Select value={newSize} onValueChange={setNewSize}>
                    <SelectTrigger id="size" className="mt-1">
                      <SelectValue placeholder="Select instance size" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTANCE_SIZES.map(size => (
                        <SelectItem key={size.size} value={size.size}>
                          {size.size} - {size.cpu} vCPU, {size.memory / 1024}GB RAM
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getSelectedSize() && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${getSelectedSize()!.price.toFixed(2)}/hour
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="instances">Number of Instances</Label>
                  <Input 
                    id="instances"
                    type="number" 
                    min={1} 
                    max={10} 
                    value={newInstanceCount} 
                    onChange={e => setNewInstanceCount(Number(e.target.value))} 
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoscale"
                    checked={newAutoScale} 
                    onCheckedChange={setNewAutoScale}
                  />
                  <Label htmlFor="autoscale">Enable Auto-scaling</Label>
                </div>

                {newAutoScale && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-instances">Min Instances</Label>
                      <Input 
                        id="min-instances"
                        type="number" 
                        min={1} 
                        max={10} 
                        value={newMinInstances} 
                        onChange={e => setNewMinInstances(Number(e.target.value))} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-instances">Max Instances</Label>
                      <Input 
                        id="max-instances"
                        type="number" 
                        min={1} 
                        max={10} 
                        value={newMaxInstances} 
                        onChange={e => setNewMaxInstances(Number(e.target.value))} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="healthcheck">Health Check Path</Label>
                  <Input 
                    id="healthcheck"
                    placeholder="/health" 
                    value={newHealthCheckPath} 
                    onChange={e => setNewHealthCheckPath(e.target.value)} 
                    className="mt-1"
                  />
                </div>

                {createError && (
                  <div className="text-sm text-red-500 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {createError}
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-2">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAdding(false)
                      setCreateError(null)
                    }}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    size="sm" 
                    onClick={createService}
                    disabled={createLoading || !newName || !newDockerImage}
                  >
                    {createLoading ? "Deploying..." : "Deploy"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Service Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>
                {selectedService?.displayName || selectedService?.name || "Service Details"}
              </DialogTitle>
              {selectedService && (
                <div className="flex flex-col gap-6 mt-4">
                  {/* Service Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Service Name</Label>
                        <p className="font-mono">{selectedService.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedService.status)}`} />
                          <span className="capitalize">{selectedService.status}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Docker Image</Label>
                        <p className="font-mono">{selectedService.dockerImage}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Instance Size</Label>
                        <p>{selectedService.size.toUpperCase()} - {selectedService.config?.cpu} vCPU, {selectedService.config?.memory / 1024}GB RAM</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Instances</Label>
                        <p>{selectedService.runningInstances || 0} / {selectedService.instanceCount} running</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created</Label>
                        <p>{new Date(selectedService.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedService.description && (
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p>{selectedService.description}</p>
                      </div>
                    )}
                    {selectedService.url && (
                      <div>
                        <Label className="text-muted-foreground">Service URL</Label>
                        <a href={selectedService.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {selectedService.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {(selectedService.status.toLowerCase() === "stopped" || selectedService.status.toLowerCase() === "failed") ? (
                      <Button 
                        size="sm"
                        onClick={() => handleServiceAction(selectedService.id, "restart")}
                        disabled={actionLoading !== null}
                      >
                        <PlayIcon className="w-4 h-4 mr-1" /> Start
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleServiceAction(selectedService.id, "restart")}
                          disabled={actionLoading !== null}
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" /> Restart
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleServiceAction(selectedService.id, "stop")}
                          disabled={actionLoading !== null}
                        >
                          <StopIcon className="w-4 h-4 mr-1" /> Stop
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleServiceAction(selectedService.id, "delete")
                        setShowDetailsModal(false) // Keep this one since delete removes the service
                      }}
                      disabled={actionLoading !== null}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>

                  {/* Logs Section */}
                  <div className="space-y-2">
                    <Label>Instance Logs</Label>
                    <div className="bg-black text-white p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
                      {logsLoading ? (
                        <div className="text-center">
                          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading logs...
                        </div>
                      ) : serviceLogs ? (
                        <div>
                          {serviceLogs.instances?.map((instance: any, idx: number) => (
                            <div key={idx} className="mb-4">
                              <div className="text-green-400 mb-2">
                                Instance: {instance.instanceId || instance.containerName} ({instance.status})
                              </div>
                              <pre className="whitespace-pre-wrap">{instance.logs || "No logs available"}</pre>
                              {instance.error && (
                                <div className="text-red-400 mt-2">Error: {instance.error}</div>
                              )}
                            </div>
                          )) || (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(serviceLogs, null, 2)}</pre>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400">No logs available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {loading && (
            <Card className="p-6 text-center text-muted-foreground">
              <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading services...
            </Card>
          )}
          
          {!loading && services.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">
              No compute services deployed yet. Click "New Service" to deploy your first instance.
            </Card>
          )}
          
          {!loading && services.map(service => (
            <Card 
              key={service.id} 
              className="flex flex-col gap-3 p-4 bg-background/80 border border-border shadow-sm rounded-xl hover:bg-accent/30 transition-colors w-full cursor-pointer"
              onClick={() => openServiceDetails(service)}
            >
              <div className="flex items-center gap-4">
                <CpuChipIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-semibold text-base text-foreground truncate">{service.name}</div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                    <span className="text-xs text-muted-foreground capitalize">{service.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{service.dockerImage}</div>
                  {service.description && (
                    <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={actionLoading !== null}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionLoading?.startsWith(service.id) ? (
                        <ArrowPathIcon className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <CpuChipIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleServiceAction(service.id, "restart")
                      }}
                      disabled={actionLoading !== null}
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" /> Restart
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleServiceAction(service.id, "stop")
                      }}
                      disabled={actionLoading !== null}
                    >
                      <StopIcon className="w-4 h-4 mr-2" /> Stop
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleServiceAction(service.id, "delete")
                      }} 
                      className="text-red-600"
                      disabled={actionLoading !== null}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div>{service.size.toUpperCase()}</div>
                {service.config && (
                  <>
                    <div>{service.config.cpu} vCPU</div>
                    <div>{service.config.memory / 1024}GB RAM</div>
                    <div>${service.config.price}/hour</div>
                  </>
                )}
                <div className="flex items-center gap-1">
                  <span>{service.runningInstances || 0}/{service.instanceCount} running</span>
                </div>
                {service.url && (
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Service
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ResizableLayout>
  )
}