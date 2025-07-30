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
import { Badge } from "@/components/ui/badge"
import { PaintBrushIcon } from "@heroicons/react/24/outline"
import { useDashboard } from "./dashboard-context"
import { dashboardTemplates, layoutStyles } from "./dashboard-templates"

export function TemplateSelector() {
  const [open, setOpen] = useState(false)
  const { setTemplate, currentTemplate, setLayout, currentLayout } = useDashboard()

  const handleTemplateChange = (templateId: string) => {
    const template = dashboardTemplates.find((t) => t.id === templateId)
    if (template) {
      setTemplate(template)
      setOpen(false)
    }
  }

  const handleLayoutChange = (layoutId: string) => {
    setLayout(layoutId as keyof typeof layoutStyles)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PaintBrushIcon className="w-4 h-4 mr-2" />
          Templates & Layout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Templates & Layouts</DialogTitle>
          <DialogDescription>Choose a template and layout style for your dashboard</DialogDescription>
        </DialogHeader>

        {/* Layout Selection */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Layout Style</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(layoutStyles).map(([key, layout]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  currentLayout === key
                    ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/10"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleLayoutChange(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm capitalize">{key} Layout</CardTitle>
                      <CardDescription className="text-xs">{layout.description}</CardDescription>
                    </div>
                    {currentLayout === key && <Badge variant="secondary">Active</Badge>}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Dashboard Templates</h3>
          <div className="grid grid-cols-1 gap-4">
            {dashboardTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  currentTemplate?.id === template.id
                    ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/10"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.cards.length} cards
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.layout} layout
                        </Badge>
                      </div>
                    </div>
                    {currentTemplate?.id === template.id && <Badge variant="secondary">Active</Badge>}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
