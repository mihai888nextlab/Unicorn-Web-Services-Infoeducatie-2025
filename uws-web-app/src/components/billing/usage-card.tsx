"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface UsageCardProps {
  service: string
  icon: LucideIcon
  usage: string
  limit: string
  cost: number
  percentage: number
  description: string
}

export function UsageCard({
  service,
  icon: IconComponent,
  usage,
  limit,
  cost,
  percentage,
  description,
}: UsageCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{service}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${cost.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">this month</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage: {usage}</span>
            <span className="text-muted-foreground">Limit: {limit}</span>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground">{percentage}% of your limit used</p>
        </div>
      </CardContent>
    </Card>
  )
}
