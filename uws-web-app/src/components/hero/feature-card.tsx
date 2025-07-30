"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
  bgColor: string
  index: number
  isHovered: boolean
  isVisible: boolean
  onHover: () => void
  onLeave: () => void
}

export function FeatureCard({
  icon: IconComponent,
  title,
  description,
  color,
  bgColor,
  index,
  isHovered,
  isVisible,
  onHover,
  onLeave,
}: FeatureCardProps) {
  return (
    <Card
      className={`hover:shadow-xl transition-all duration-500 border-0 bg-background cursor-pointer transform hover:-translate-y-2 ${isHovered ? "scale-105" : "scale-100"}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
      }}
    >
      <CardContent className="p-6">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${isHovered ? bgColor : "from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20"} rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"}`}
        >
          <IconComponent
            className={`w-6 h-6 transition-all duration-500 ${isHovered ? `bg-gradient-to-r ${color} bg-clip-text text-transparent` : "text-purple-600 dark:text-purple-400"}`}
          />
        </div>
        <h3
          className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isHovered ? "text-purple-600" : ""}`}
        >
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
