"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface ServiceCardProps {
  name: string
  description: string
  icon: LucideIcon
  status: string
  usage: string
}

export function ServiceCard({ name, description, icon: IconComponent, status, usage }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            {status}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{usage}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
