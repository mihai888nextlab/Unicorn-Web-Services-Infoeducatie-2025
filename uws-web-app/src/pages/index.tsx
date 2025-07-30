"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeroHeader } from "@/components/hero/hero-header"
import { HeroFooter } from "@/components/hero/hero-footer"
import {
  ServerIcon,
  BoltIcon,
  CircleStackIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon,
  PlayIcon,
  StarIcon,
  SparklesIcon,
  CubeTransparentIcon,
  CommandLineIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline"
import { useState, useEffect, useRef } from "react"

export default function HeroPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [currentStat, setCurrentStat] = useState(0)
  const [animatedStats, setAnimatedStats] = useState({
    uptime: 0,
    latency: 0,
    developers: 0,
    support: 0,
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)

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

  const benefits = [
    "99.99% uptime SLA",
    "Global edge network",
    "24/7 expert support",
    "Pay-as-you-scale pricing",
    "Enterprise security",
    "One-click deployments",
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechFlow",
      content: "UWS helped us scale from startup to enterprise seamlessly. The platform just works.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Developer, DataSync",
      content: "Best cloud platform we've used. Simple, powerful, and incredibly reliable.",
      rating: 5,
    },
  ]

  const stats = [
    { label: "Uptime", value: 99.99, suffix: "%" },
    { label: "Global latency", value: 50, suffix: "ms" },
    { label: "Developers", value: 10000, suffix: "+" },
    { label: "Support", value: 24, suffix: "/7" },
  ]

  // Animate stats on mount
  useEffect(() => {
    setIsVisible(true)

    const animateStats = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)

        setAnimatedStats({
          uptime: Number((99.99 * easeOut).toFixed(2)),
          latency: Math.floor(50 * easeOut),
          developers: Math.floor(10000 * easeOut),
          support: Math.floor(24 * easeOut),
        })

        if (step >= steps) {
          clearInterval(timer)
        }
      }, stepDuration)
    }

    const timeout = setTimeout(animateStats, 500)
    return () => clearTimeout(timeout)
  }, [])

  // Cycle through stats highlight
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
      setShowScrollTop(window.scrollY > 300)
      
      // Update active section based on scroll
      const sections = [
        { ref: heroRef, name: 'hero' },
        { ref: featuresRef, name: 'features' },
        { ref: benefitsRef, name: 'benefits' }
      ]
      
      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.name)
            break
          }
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Enhanced animated background with parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            animationDelay: "1s",
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/5 to-blue-300/5 rounded-full blur-3xl"
          style={{
            transform: `translate(${-50 + mousePosition.x * 0.01}%, ${-50 + mousePosition.y * 0.01}%) scale(${1 + scrollY * 0.0003})`,
            transition: 'transform 0.6s ease-out'
          }}
        ></div>
      </div>

      {/* Header */}
      <HeroHeader isVisible={isVisible} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative" ref={heroRef}>
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          style={{
            transform: `translateY(${scrollY * -0.3}px)`,
          }}
        >
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-400 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer animate-bounce inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            style={{ animationDelay: "2s", animationDuration: "2s", animationIterationCount: "3" }}
          >
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            Now with AI-powered optimization
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
              Cloud infrastructure
            </span>
            <br />
            <span className="inline-block hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              that scales with you
            </span>
            <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-purple-400/10 blur-3xl opacity-50 animate-pulse" />
          </h1>

          <p
            className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            Deploy, scale, and manage your applications with our simple yet powerful cloud platform. Built for
            developers, trusted by enterprises.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 hover:scale-110 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Building
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 bg-transparent hover:scale-110 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 group border-2 hover:border-purple-400"
            >
              <PlayIcon className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:text-purple-600 transition-all duration-300" />
              Watch Demo
            </Button>
          </div>

          {/* Enhanced Animated Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div
              className={`text-center transition-all duration-500 cursor-pointer hover:transform hover:-translate-y-2 ${currentStat === 0 ? "scale-110" : "scale-100"}`}
            >
              <div className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text ${currentStat === 0 ? "text-transparent" : ""}`}>
                {animatedStats.uptime}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Uptime</div>
              <div className={`h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mt-2 transition-all duration-500 ${currentStat === 0 ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
            </div>
            <div
              className={`text-center transition-all duration-500 cursor-pointer hover:transform hover:-translate-y-2 ${currentStat === 1 ? "scale-110" : "scale-100"}`}
            >
              <div className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text ${currentStat === 1 ? "text-transparent" : ""}`}>
                {animatedStats.latency}ms
              </div>
              <div className="text-sm text-muted-foreground mt-1">Global latency</div>
              <div className={`h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mt-2 transition-all duration-500 ${currentStat === 1 ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
            </div>
            <div
              className={`text-center transition-all duration-500 cursor-pointer hover:transform hover:-translate-y-2 ${currentStat === 2 ? "scale-110" : "scale-100"}`}
            >
              <div className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text ${currentStat === 2 ? "text-transparent" : ""}`}>
                {animatedStats.developers.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Developers</div>
              <div className={`h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mt-2 transition-all duration-500 ${currentStat === 2 ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
            </div>
            <div
              className={`text-center transition-all duration-500 cursor-pointer hover:transform hover:-translate-y-2 ${currentStat === 3 ? "scale-110" : "scale-100"}`}
            >
              <div className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text ${currentStat === 3 ? "text-transparent" : ""}`}>
                {animatedStats.support}/7
              </div>
              <div className="text-sm text-muted-foreground mt-1">Support</div>
              <div className={`h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mt-2 transition-all duration-500 ${currentStat === 3 ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 bg-muted/30 relative" ref={featuresRef}>
        <div className="text-center mb-16" style={{ transform: `translateY(${Math.max(0, (scrollY - 400) * -0.1)}px)` }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Everything you need to build and scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From compute and storage to databases and AI, we provide all the building blocks for modern applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const isHovered = hoveredFeature === index
            return (
              <Card
                key={index}
                className={`hover:shadow-2xl transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm cursor-pointer transform hover:-translate-y-3 relative overflow-hidden group ${isHovered ? "scale-105" : "scale-100"}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
                  transform: `perspective(1000px) rotateX(${isHovered ? -5 : 0}deg) rotateY(${isHovered ? 5 : 0}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <CardContent className="p-6 relative z-10">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${isHovered ? feature.bgColor : "from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20"} rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-lg ${isHovered ? "scale-125 rotate-12 shadow-xl" : "scale-100 rotate-0"}`}
                  >
                    <IconComponent
                      className={`w-7 h-7 transition-all duration-500 ${isHovered ? `text-purple-600 dark:text-purple-400` : "text-purple-600 dark:text-purple-400"}`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-2 transition-all duration-300 ${isHovered ? "text-purple-600 dark:text-purple-400" : ""}`}
                  >
                    {feature.title}
                  </h3>
                  <p className={`text-muted-foreground text-sm leading-relaxed transition-all duration-300 ${isHovered ? "text-foreground" : ""}`}>
                    {feature.description}
                  </p>
                  <div className={`mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${isHovered ? "translate-x-0" : "-translate-x-4"}`}>
                    Learn more
                    <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20" ref={benefitsRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 hover:scale-105 transition-transform duration-300 inline-block">
              Why developers choose UWS
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Focus on building great products while we handle the infrastructure complexity.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 hover:translate-x-3 transition-all duration-300 group cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? "slideInLeft 0.6s ease-out forwards" : "none",
                  }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300" />
                  </div>
                  <span className="text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <Button className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-110 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                Explore Features
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-purple-200/50 dark:border-purple-700/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <CommandLineIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Monthly Cost
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    $247.50
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group/item cursor-pointer hover:translate-x-1">
                    <span className="flex items-center gap-2">
                      <ServerIcon className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      Compute (12 instances)
                    </span>
                    <span className="font-semibold">$89.60</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group/item cursor-pointer hover:translate-x-1">
                    <span className="flex items-center gap-2">
                      <ArchiveBoxIcon className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      Storage (2.4 TB)
                    </span>
                    <span className="font-semibold">$58.40</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group/item cursor-pointer hover:translate-x-1">
                    <span className="flex items-center gap-2">
                      <BoltIcon className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      Functions (1.2M calls)
                    </span>
                    <span className="font-semibold">$24.80</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group/item cursor-pointer hover:translate-x-1">
                    <span className="flex items-center gap-2">
                      <CircleStackIcon className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      Databases (3 instances)
                    </span>
                    <span className="font-semibold">$45.20</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-purple-200/50 dark:border-purple-700/30">
                  <div className="text-xs text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 animate-pulse" />
                    AI suggests: Optimize 3 underutilized servers to save ~$25/month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
            Trusted by teams worldwide
          </h2>
          <p className="text-lg text-muted-foreground">See what developers and CTOs are saying about UWS.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 bg-background/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer group relative overflow-hidden"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex mb-4 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400 hover:scale-150 transition-all duration-300 cursor-pointer"
                      style={{ 
                        animationDelay: `${i * 100}ms`,
                        transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300 text-base leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl p-12 border-2 border-purple-200/50 dark:border-purple-700/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block">
              Ready to build something amazing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto group-hover:text-foreground transition-colors duration-300">
              Join thousands of developers who trust UWS to power their applications. Start with our free tier and scale
              as you grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-6 text-lg hover:scale-110 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                asChild
              >
                <a href="/dashboard">
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg bg-transparent hover:scale-110 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-xl border-2 hover:border-purple-400"
              >
                Talk to Sales
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 flex items-center justify-center gap-2">
              <CheckIcon className="w-4 h-4" />
              No credit card required • Free tier includes $100 credits
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <HeroFooter />

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-rotate {
          animation: rotate 20s linear infinite;
        }
      `}</style>
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Scroll to top button */}
      <Button
        className={`fixed bottom-8 right-8 z-50 rounded-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:scale-110 transition-all duration-300 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUpIcon className="w-5 h-5" />
      </Button>
    </div>
  )
}
