"use client"

import { DashboardCardBase } from "../card-base"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  id: string
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  iconColor: string
  iconBg: string
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function StatsCard({
  id,
  title,
  value,
  change,
  changeType = "neutral",
  icon: IconComponent,
  iconColor,
  iconBg,
  size = "small",
  onRemove,
  onConfigure,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  }

  return (
    <DashboardCardBase
      id={id}
      title={title}
      type="Statistics"
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold truncate">{value}</div>
          {change && <div className={`text-sm ${changeColors[changeType]}`}>{change}</div>}
        </div>
      </div>
    </DashboardCardBase>
  )
}
