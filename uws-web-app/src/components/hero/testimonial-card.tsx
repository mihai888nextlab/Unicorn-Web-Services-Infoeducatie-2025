"use client"

import { Card, CardContent } from "@/components/ui/card"
import { StarIcon } from "@heroicons/react/24/outline"

interface TestimonialCardProps {
  name: string
  role: string
  content: string
  rating: number
  index: number
  isVisible: boolean
}

export function TestimonialCard({ name, role, content, rating, index, isVisible }: TestimonialCardProps) {
  return (
    <Card
      className="border-0 bg-background hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer group"
      style={{
        animationDelay: `${index * 200}ms`,
        animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
      }}
    >
      <CardContent className="p-6">
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <StarIcon
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400 hover:scale-125 transition-transform duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <p className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300">
          "{content}"
        </p>
        <div>
          <div className="font-semibold text-sm group-hover:text-purple-600 transition-colors duration-300">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </CardContent>
    </Card>
  )
}
