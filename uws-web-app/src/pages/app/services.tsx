"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  CloudIcon,
  CircleStackIcon,
  CpuChipIcon,
  BoltIcon,
  QueueListIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ServerIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import { ResizableLayout } from "@/components/layout/resizable-layout"

interface ServiceStats {
  total: number
  active: number
  error: number
}

interface Service {
  id: string
  name: string
  displayName: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  category: "storage" | "database" | "compute" | "serverless" | "messaging" | "security"
  features: string[]
  pricing: string
  stats?: ServiceStats
  status: "healthy" | "degraded" | "error" | "loading"
}

const services: Service[] = [
  {
    id: "storage",
    name: "Object Storage",
    displayName: "Cloud Storage",
    description: "Scalable object storage service for files, images, and data backup with S3-compatible API",
    icon: CloudIcon,
    path: "/app/services/storage",
    category: "storage",
    features: ["S3-Compatible API", "Public/Private Buckets", "File Upload/Download", "Object Management"],
    pricing: "$0.021/GB/month",
    status: "healthy"
  },
  {
    id: "database",
    name: "Database Services",
    displayName: "Managed Databases",
    description: "PostgreSQL and NoSQL database services with high availability and automated backups",
    icon: CircleStackIcon,
    path: "/app/services/database",
    category: "database",
    features: ["PostgreSQL", "MongoDB", "High Availability", "Automated Backups", "Query Editor"],
    pricing: "From $15/month",
    status: "healthy"
  },
  {
    id: "compute",
    name: "Compute Services",
    displayName: "Container Compute",
    description: "Scalable containerized compute instances with various CPU and memory configurations",
    icon: CpuChipIcon,
    path: "/app/services/compute",
    category: "compute",
    features: ["Docker Containers", "Auto Scaling", "Load Balancing", "Custom Images"],
    pricing: "From $0.012/hour",
    status: "healthy"
  },
  {
    id: "lambda",
    name: "Lambda Functions",
    displayName: "Serverless Functions",
    description: "Event-driven serverless computing platform supporting multiple programming languages",
    icon: BoltIcon,
    path: "/app/services/lambda",
    category: "serverless",
    features: ["Multiple Runtimes", "Event Triggers", "Code Editor", "Version Control", "Metrics"],
    pricing: "$0.20/1M requests + compute",
    status: "healthy"
  },
  {
    id: "queue",
    name: "Message Queue",
    displayName: "Simple Queue Service",
    description: "Reliable message queuing service for decoupling application components",
    icon: QueueListIcon,
    path: "/app/services/queue",
    category: "messaging",
    features: ["FIFO Queues", "Dead Letter Queues", "Batch Operations", "Long Polling"],
    pricing: "1M requests free, then $0.50/M",
    status: "healthy"
  },
  {
    id: "secrets",
    name: "Secrets Manager",
    displayName: "Secrets Management",
    description: "Secure storage and management of API keys, passwords, and sensitive configuration data",
    icon: KeyIcon,
    path: "/app/services/secrets",
    category: "security",
    features: ["Encrypted Storage", "Access Control", "Version History", "Secure Sharing"],
    pricing: "$0.50/secret/month",
    status: "healthy"
  }
]

const categoryColors = {
  storage: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  database: "bg-green-500/10 text-green-700 border-green-500/20",
  compute: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  serverless: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  messaging: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  security: "bg-red-500/10 text-red-700 border-red-500/20"
}

const statusColors = {
  healthy: "text-green-600",
  degraded: "text-yellow-600", 
  error: "text-red-600",
  loading: "text-gray-600"
}

const statusIcons = {
  healthy: CheckCircleIcon,
  degraded: ExclamationTriangleIcon,
  error: ExclamationTriangleIcon,
  loading: ArrowPathIcon
}

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [systemStats, setSystemStats] = useState({
    totalServices: 6,
    healthyServices: 6,
    totalResources: 0,
    activeResources: 0
  })

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(services.map(s => s.category)))

  const getStatusIcon = (status: Service["status"]) => {
    const Icon = statusIcons[status]
    return <Icon className={`w-4 h-4 ${statusColors[status]} ${status === 'loading' ? 'animate-spin' : ''}`} />
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cloud Services</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive cloud infrastructure and platform services
              </p>
            </div>
            <Button variant="outline" size="sm">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>

          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <ServerIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalServices}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStats.healthyServices}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operating normally
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <ChartBarIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Service categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services, features, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.displayName}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={categoryColors[service.category]}>
                              {service.category}
                            </Badge>
                            {getStatusIcon(service.status)}
                          </div>
                        </div>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {service.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Starting at </span>
                          <span className="font-medium">{service.pricing}</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={() => window.location.href = service.path}
                        >
                          Open
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MagnifyingGlassIcon className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-sm text-center">
                  Try adjusting your search terms or category filter
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Service Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => {
                  const categoryServices = services.filter(s => s.category === category)
                  const categoryIcon = categoryServices[0]?.icon || ServerIcon
                  const Icon = categoryIcon
                  
                  return (
                    <div key={category} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">{category}</div>
                        <div className="text-sm text-muted-foreground">
                          {categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResizableLayout>
  )
}