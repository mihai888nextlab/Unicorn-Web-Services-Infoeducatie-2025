"use client"

import { DashboardCardBase } from "../card-base"
import { StatsCard as StatCard } from "../stats-card"
import { ServerIcon, ChartBarIcon, CreditCardIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

interface QuickStatsCardProps {
  id: string
  title: string
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function QuickStatsCard({ id, title, size = "wide", onRemove, onConfigure }: QuickStatsCardProps) {
  const stats = [
    {
      title: "Active Resources",
      value: "47",
      icon: ServerIcon,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Health Score",
      value: "98%",
      icon: ChartBarIcon,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Monthly Cost",
      value: "$247.50",
      icon: CreditCardIcon,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Security Score",
      value: "A+",
      icon: ShieldCheckIcon,
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <DashboardCardBase
      id={id}
      title={title}
      type="Statistics Overview"
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
      className="col-span-4 row-span-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
    </DashboardCardBase>
  )
}
