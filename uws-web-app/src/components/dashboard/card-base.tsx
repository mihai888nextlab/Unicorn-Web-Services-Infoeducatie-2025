"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XMarkIcon, Cog6ToothIcon, Bars3Icon } from "@heroicons/react/24/outline"
import type React from "react"

export interface DashboardCardProps {
  id: string
  title: string
  type: string
  size: "small" | "medium" | "large" | "wide"
  onRemove?: (id: string) => void
  onConfigure?: (id: string) => void
  children: React.ReactNode
  className?: string
}

export function DashboardCardBase({
  id,
  title,
  type,
  size,
  onRemove,
  onConfigure,
  children,
  className = "",
}: DashboardCardProps) {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 row-span-2",
    large: "col-span-2 row-span-2",
    wide: "col-span-2 row-span-1",
  }

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] ${sizeClasses[size]} ${className}`}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Bars3Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onConfigure && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onConfigure(id)
              }}
              title="Configure"
            >
              <Cog6ToothIcon className="h-3 w-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(id)
              }}
              title="Remove"
            >
              <XMarkIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}
