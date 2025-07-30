"use client"

import { DashboardCardBase } from "@/components/dashboard/card-base"

interface ChartCardProps {
  id: string
  title: string
  chartType: "line" | "bar" | "pie" | "area"
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function ChartCard({ id, title, chartType, size = "large", onRemove, onConfigure }: ChartCardProps) {
  return (
    <DashboardCardBase
      id={id}
      title={title}
      type={`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="h-32 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm text-muted-foreground">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </div>
          <div className="text-xs text-muted-foreground mt-1">Configure to add data</div>
        </div>
      </div>
    </DashboardCardBase>
  )
}
