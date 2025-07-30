"use client"

import { DashboardCardBase } from "../card-base"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface QuickActionsCardProps {
  id: string
  title: string
  actions: Array<{
    label: string
    icon: LucideIcon
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }>
  size?: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
}

export function QuickActionsCard({
  id,
  title,
  actions,
  size = "medium",
  onRemove,
  onConfigure,
}: QuickActionsCardProps) {
  return (
    <DashboardCardBase
      id={id}
      title={title}
      type="Quick Actions"
      size={size}
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            className="justify-start"
            onClick={action.onClick}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </DashboardCardBase>
  )
}
