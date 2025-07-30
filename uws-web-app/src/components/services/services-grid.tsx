"use client"

import { useMemo } from "react"
import { ServiceCard } from "./service-card"
import { ServiceListItem } from "./service-list-item"
import {
  ArchiveBoxIcon,
  ServerIcon,
  BoltIcon,
  CircleStackIcon,
  QueueListIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"

interface ServicesGridProps {
  searchQuery: string
  selectedCategory: string
  selectedStatus: string
  viewMode: "grid" | "list"
  sortBy: string
  sortOrder: "asc" | "desc"
}

const services = [
  {
    id: "s3-storage",
    name: "S3 Storage",
    description: "Scalable object storage with 99.999999999% durability",
    category: "storage",
    icon: ArchiveBoxIcon,
    status: "active",
    usage: "2.4 TB used",
    cost: "$58.40/month",
    instances: 1,
    region: "us-east-1",
    lastUpdated: "2 hours ago",
    costValue: 58.4,
    metrics: {
      requests: "1.2M",
      bandwidth: "450 GB",
      availability: "99.99%",
    },
  },
  {
    id: "compute",
    name: "Compute Instances",
    description: "Virtual servers with auto-scaling capabilities",
    category: "compute",
    icon: ServerIcon,
    status: "active",
    usage: "12 instances",
    cost: "$89.60/month",
    instances: 12,
    region: "us-east-1, eu-west-1",
    lastUpdated: "5 minutes ago",
    costValue: 89.6,
    metrics: {
      cpu: "45%",
      memory: "67%",
      uptime: "99.95%",
    },
  },
  {
    id: "lambda",
    name: "Lambda Functions",
    description: "Serverless compute for event-driven applications",
    category: "compute",
    icon: BoltIcon,
    status: "active",
    usage: "1.2M invocations",
    cost: "$24.80/month",
    instances: 8,
    region: "global",
    lastUpdated: "1 minute ago",
    costValue: 24.8,
    metrics: {
      invocations: "1.2M",
      duration: "125ms avg",
      errors: "0.02%",
    },
  },
  {
    id: "rdb",
    name: "Relational Database",
    description: "Managed PostgreSQL and MySQL databases",
    category: "database",
    icon: CircleStackIcon,
    status: "active",
    usage: "3 databases",
    cost: "$45.20/month",
    instances: 3,
    region: "us-east-1",
    lastUpdated: "30 minutes ago",
    costValue: 45.2,
    metrics: {
      connections: "45/100",
      storage: "12.5 GB",
      iops: "1,250",
    },
  },
  {
    id: "nosql",
    name: "NoSQL Database",
    description: "High-performance document and key-value store",
    category: "database",
    icon: CircleStackIcon,
    status: "active",
    usage: "5 collections",
    cost: "$32.10/month",
    instances: 2,
    region: "us-east-1, ap-south-1",
    lastUpdated: "1 hour ago",
    costValue: 32.1,
    metrics: {
      documents: "2.5M",
      reads: "15K/sec",
      writes: "3K/sec",
    },
  },
  {
    id: "queue",
    name: "Message Queue",
    description: "Reliable message queuing and processing service",
    category: "compute",
    icon: QueueListIcon,
    status: "warning",
    usage: "450K messages",
    cost: "$18.90/month",
    instances: 1,
    region: "us-east-1",
    lastUpdated: "15 minutes ago",
    costValue: 18.9,
    metrics: {
      messages: "450K",
      throughput: "1.2K/min",
      latency: "45ms",
    },
  },
  {
    id: "secrets",
    name: "Secrets Manager",
    description: "Secure storage and rotation of API keys and passwords",
    category: "security",
    icon: ShieldCheckIcon,
    status: "active",
    usage: "28 secrets",
    cost: "$14.00/month",
    instances: 1,
    region: "global",
    lastUpdated: "6 hours ago",
    costValue: 14.0,
    metrics: {
      secrets: "28",
      rotations: "12/month",
      access: "1.5K/day",
    },
  },
  {
    id: "iam",
    name: "Identity & Access",
    description: "User authentication and authorization management",
    category: "security",
    icon: UsersIcon,
    status: "active",
    usage: "15 users, 8 roles",
    cost: "$12.50/month",
    instances: 1,
    region: "global",
    lastUpdated: "3 hours ago",
    costValue: 12.5,
    metrics: {
      users: "15",
      roles: "8",
      policies: "24",
    },
  },
  {
    id: "monitoring",
    name: "Monitoring & Alerts",
    description: "Real-time monitoring and alerting for all services",
    category: "compute",
    icon: ChartBarIcon,
    status: "active",
    usage: "Real-time monitoring",
    cost: "$25.30/month",
    instances: 1,
    region: "global",
    lastUpdated: "Live",
    costValue: 25.3,
    metrics: {
      metrics: "2.5K",
      alerts: "3 active",
      dashboards: "12",
    },
  },
  {
    id: "cdn",
    name: "Content Delivery",
    description: "Global content delivery network with edge caching",
    category: "networking",
    icon: GlobeAltIcon,
    status: "active",
    usage: "850 GB transferred",
    cost: "$42.80/month",
    instances: 1,
    region: "global",
    lastUpdated: "10 minutes ago",
    costValue: 42.8,
    metrics: {
      requests: "5.2M",
      bandwidth: "850 GB",
      cache_hit: "94%",
    },
  },
]

export function ServicesGrid({
  searchQuery,
  selectedCategory,
  selectedStatus,
  viewMode,
  sortBy,
  sortOrder,
}: ServicesGridProps) {
  const filteredAndSortedServices = useMemo(() => {
    const filtered = services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || service.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort services
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "cost":
          aValue = a.costValue
          bValue = b.costValue
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "category":
          aValue = a.category
          bValue = b.category
          break
        case "updated":
          // Simple sorting by lastUpdated string for demo
          aValue = a.lastUpdated
          bValue = b.lastUpdated
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder])

  if (filteredAndSortedServices.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">No services found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {filteredAndSortedServices.map((service) => (
          <ServiceListItem key={service.id} service={service} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAndSortedServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}
