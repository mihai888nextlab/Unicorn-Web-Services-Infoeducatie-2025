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
  // Service Cards
  {
    type: "storage-service",
    title: "Object Storage",
    description: "S3-compatible storage service overview",
    icon: "☁️",
    defaultSize: "medium" as const,
    category: "services",
  },
  {
    type: "database-service",
    title: "Database Services",
    description: "PostgreSQL and MongoDB database overview",
    icon: "🗃️",
    defaultSize: "medium" as const,
    category: "services",
  },
  {
    type: "compute-service",
    title: "Compute Services",
    description: "Container and instance management",
    icon: "⚙️",
    defaultSize: "medium" as const,
    category: "services",
  },
  {
    type: "lambda-service",
    title: "Lambda Functions",
    description: "Serverless function management",
    icon: "⚡",
    defaultSize: "medium" as const,
    category: "services",
  },
  {
    type: "queue-service",
    title: "Message Queue",
    description: "Message queue service overview",
    icon: "📋",
    defaultSize: "medium" as const,
    category: "services",
  },
  {
    type: "secrets-service",
    title: "Secrets Manager",
    description: "Secure secrets and configuration management",
    icon: "🔐",
    defaultSize: "medium" as const,
    category: "services",
  },
  // General Cards
  {
    type: "stats",
    title: "Statistics Card",
    description: "Display key metrics and numbers",
    icon: "📊",
    defaultSize: "small" as const,
    category: "general",
  },
  {
    type: "service-status",
    title: "Service Status",
    description: "Monitor service health and uptime",
    icon: "🟢",
    defaultSize: "medium" as const,
    category: "general",
  },
  {
    type: "chart",
    title: "Chart",
    description: "Visualize data with charts and graphs",
    icon: "📈",
    defaultSize: "large" as const,
    category: "general",
  },
  {
    type: "quick-actions",
    title: "Quick Actions",
    description: "Shortcuts to common tasks",
    icon: "⚡",
    defaultSize: "medium" as const,
    category: "general",
  },
  {
    type: "recent-activity",
    title: "Recent Activity",
    description: "Show latest system activities",
    icon: "📝",
    defaultSize: "wide" as const,
    category: "general",
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
        <div className="space-y-6 mt-4">
          {/* Service Cards Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">🏗️ Service Overview Cards</h3>
            <div className="grid grid-cols-2 gap-3">
              {cardTypes.filter(card => card.category === "services").map((cardType) => (
                <Card
                  key={cardType.type}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
                  onClick={() => handleAddCard(cardType)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{cardType.icon}</div>
                      <div>
                        <CardTitle className="text-sm">{cardType.title}</CardTitle>
                        <CardDescription className="text-xs">{cardType.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* General Cards Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">📊 General Dashboard Cards</h3>
            <div className="grid grid-cols-2 gap-3">
              {cardTypes.filter(card => card.category === "general").map((cardType) => (
                <Card
                  key={cardType.type}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
                  onClick={() => handleAddCard(cardType)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{cardType.icon}</div>
                      <div>
                        <CardTitle className="text-sm">{cardType.title}</CardTitle>
                        <CardDescription className="text-xs">{cardType.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
