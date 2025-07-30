"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ServiceListItemProps {
  service: {
    id: string
    name: string
    description: string
    category: string
    icon: any
    status: string
    usage: string
    cost: string
    instances: number
    region: string
    lastUpdated: string
    metrics: Record<string, string | undefined>
  }
}

export function ServiceListItem({ service }: ServiceListItemProps) {
  const IconComponent = service.icon

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  }

  return (
    <Card className="hover:shadow-sm transition-all duration-200 group cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-semibold truncate">{service.name}</h3>
                <Badge
                  variant="secondary"
                  className={`${statusColors[service.status as keyof typeof statusColors]} text-xs`}
                >
                  {service.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{service.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-medium">{service.usage}</div>
              <div className="text-xs text-muted-foreground">Usage</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-green-600">{service.cost}</div>
              <div className="text-xs text-muted-foreground">Cost</div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                Manage
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Logs</DropdownMenuItem>
                  <DropdownMenuItem>Configure</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
