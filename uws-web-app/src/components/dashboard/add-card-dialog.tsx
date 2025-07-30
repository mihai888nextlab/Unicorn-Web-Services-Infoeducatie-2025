"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "@heroicons/react/24/outline"
import { useDashboard } from "../dashboard/dashboard-context"

const cardTypes = [
  {
    type: "stats",
    title: "Statistics Card",
    description: "Display key metrics and numbers",
    icon: "📊",
    defaultSize: "small" as const,
  },
  {
    type: "service-status",
    title: "Service Status",
    description: "Monitor service health and uptime",
    icon: "🟢",
    defaultSize: "medium" as const,
  },
  {
    type: "chart",
    title: "Chart",
    description: "Visualize data with charts and graphs",
    icon: "📈",
    defaultSize: "large" as const,
  },
  {
    type: "quick-actions",
    title: "Quick Actions",
    description: "Shortcuts to common tasks",
    icon: "⚡",
    defaultSize: "medium" as const,
  },
  {
    type: "recent-activity",
    title: "Recent Activity",
    description: "Show latest system activities",
    icon: "📝",
    defaultSize: "wide" as const,
  },
]

export function AddCardDialog() {
  const [open, setOpen] = useState(false)
  const { addCard } = useDashboard()

  const handleAddCard = (cardType: (typeof cardTypes)[0]) => {
    addCard({
      type: cardType.type,
      title: cardType.title,
      size: cardType.defaultSize,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Dashboard Card</DialogTitle>
          <DialogDescription>Choose a card type to add to your dashboard</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {cardTypes.map((cardType) => (
            <Card
              key={cardType.type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleAddCard(cardType)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{cardType.icon}</div>
                  <div>
                    <CardTitle className="text-sm">{cardType.title}</CardTitle>
                    <CardDescription className="text-xs">{cardType.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
