"use client"

import { useState } from "react"
import {
  ServerIcon,
  ArchiveBoxIcon,
  BoltIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { FeatureCard } from "./feature-card"

interface FeaturesSectionProps {
  isVisible: boolean
}

export function FeaturesSection({ isVisible }: FeaturesSectionProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: ServerIcon,
      title: "Compute",
      description: "Scalable virtual servers with auto-scaling capabilities",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
    {
      icon: ArchiveBoxIcon,
      title: "Storage",
      description: "Secure, durable object storage with global CDN",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    },
    {
      icon: BoltIcon,
      title: "Serverless",
      description: "Run code without managing servers or infrastructure",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    },
    {
      icon: CircleStackIcon,
      title: "Databases",
      description: "Managed SQL and NoSQL databases with automatic backups",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    },
    {
      icon: ShieldCheckIcon,
      title: "Security",
      description: "Enterprise-grade security with compliance certifications",
      color: "from-red-500 to-rose-500",
      bgColor: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    },
    {
      icon: ChartBarIcon,
      title: "Monitoring",
      description: "Real-time insights and performance monitoring",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
    },
  ]

  return (
    <section className="container mx-auto px-6 py-20 bg-muted/30 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
          Everything you need to build and scale
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From compute and storage to databases and AI, we provide all the building blocks for modern applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            bgColor={feature.bgColor}
            index={index}
            isHovered={hoveredFeature === index}
            isVisible={isVisible}
            onHover={() => setHoveredFeature(index)}
            onLeave={() => setHoveredFeature(null)}
          />
        ))}
      </div>
    </section>
  )
}
