"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, PlayIcon } from "@heroicons/react/24/outline"

interface HeroSectionProps {
  isVisible: boolean
  animatedStats: {
    uptime: number
    latency: number
    developers: number
    support: number
  }
  currentStat: number
}

export function HeroSection({ isVisible, animatedStats, currentStat }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-6 py-20 relative">
      <div
        className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <Badge
          variant="secondary"
          className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:scale-105 transition-transform duration-300 cursor-pointer animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "2s", animationIterationCount: "3" }}
        >
          ✨ Now with AI-powered optimization
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
          Cloud infrastructure
          <br />
          <span className="inline-block hover:scale-105 transition-transform duration-300">that scales with you</span>
        </h1>

        <p
          className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          Deploy, scale, and manage your applications with our simple yet powerful cloud platform. Built for developers,
          trusted by enterprises.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 hover:scale-105 transition-all duration-300 hover:shadow-xl group"
          >
            Start Building
            <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 bg-transparent hover:scale-105 transition-all duration-300 group"
          >
            <PlayIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Watch Demo
          </Button>
        </div>

        {/* Animated Stats */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div
            className={`text-center transition-all duration-500 ${currentStat === 0 ? "scale-110 text-purple-600" : "scale-100"}`}
          >
            <div className="text-3xl font-bold">{animatedStats.uptime}%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div
            className={`text-center transition-all duration-500 ${currentStat === 1 ? "scale-110 text-purple-600" : "scale-100"}`}
          >
            <div className="text-3xl font-bold">{animatedStats.latency}ms</div>
            <div className="text-sm text-muted-foreground">Global latency</div>
          </div>
          <div
            className={`text-center transition-all duration-500 ${currentStat === 2 ? "scale-110 text-purple-600" : "scale-100"}`}
          >
            <div className="text-3xl font-bold">{animatedStats.developers.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Developers</div>
          </div>
          <div
            className={`text-center transition-all duration-500 ${currentStat === 3 ? "scale-110 text-purple-600" : "scale-100"}`}
          >
            <div className="text-3xl font-bold">{animatedStats.support}/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
