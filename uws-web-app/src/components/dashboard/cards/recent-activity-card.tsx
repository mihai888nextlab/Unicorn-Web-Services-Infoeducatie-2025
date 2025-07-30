"use client"

import { DashboardCardBase } from "../card-base"
import { Badge } from "@/components/ui/badge"

interface ActivityItem {
  id: string
  action: string
  resource: string
  timestamp: string
  status: "success" | "error" | "warning" | "info"
}

interface RecentActivityCardProps {
  id: string
  title: string
  activities: ActivityItem[]
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function RecentActivityCard({
  id,
  title,
  activities,
  size = "wide",
  onRemove,
  onConfigure,
}: RecentActivityCardProps) {
  const statusColors = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  }

  return (
    <DashboardCardBase
      id={id}
      title={title}
      type="Activity Log"
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-3 max-h-32 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between text-sm">
            <div className="flex-1 min-w-0">
              <span className="font-medium">{activity.action}</span>
              <span className="text-muted-foreground"> on </span>
              <span className="font-medium">{activity.resource}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="secondary" className={statusColors[activity.status]}>
                {activity.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCardBase>
  )
}
