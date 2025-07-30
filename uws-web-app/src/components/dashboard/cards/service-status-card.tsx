"use client"

import { DashboardCardBase } from "@/components/dashboard/card-base"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface ServiceStatusCardProps {
  id: string
  title: string
  services: Array<{
    name: string
    status: "online" | "offline" | "warning"
    icon: LucideIcon
  }>
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function ServiceStatusCard({
  id,
  title,
  services,
  size = "medium",
  onRemove,
  onConfigure,
}: ServiceStatusCardProps) {
  const statusColors = {
    online: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    offline: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  }

  return (
    <DashboardCardBase
      id={id}
      title={title}
      type="Service Status"
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <service.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium truncate">{service.name}</span>
            </div>
            <Badge variant="secondary" className={statusColors[service.status]}>
              {service.status}
            </Badge>
          </div>
        ))}
      </div>
    </DashboardCardBase>
  )
}
