"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  CloudIcon,
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
} from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"

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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <header
        className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <CloudIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Unicorn Web Services</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hover:scale-105 transition-transform duration-200" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">
                Pricing
              </Button>
              <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">
                Docs
              </Button>
              <ThemeToggle />
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 transition-all duration-200 hover:shadow-lg">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
            Deploy, scale, and manage your applications with our simple yet powerful cloud platform. Built for
            developers, trusted by enterprises.
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

      {/* Features Section */}
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
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const isHovered = hoveredFeature === index
            return (
              <Card
                key={index}
                className={`hover:shadow-xl transition-all duration-500 border-0 bg-background cursor-pointer transform hover:-translate-y-2 ${isHovered ? "scale-105" : "scale-100"}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
                }}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${isHovered ? feature.bgColor : "from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20"} rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"}`}
                  >
                    <IconComponent
                      className={`w-6 h-6 transition-all duration-500 ${isHovered ? `bg-gradient-to-r ${feature.color} bg-clip-text text-transparent` : "text-purple-600 dark:text-purple-400"}`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isHovered ? "text-purple-600" : ""}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
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
                  className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300 group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? "slideInLeft 0.6s ease-out forwards" : "none",
                  }}
                >
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm group-hover:text-purple-600 transition-colors duration-300">{benefit}</span>
                </div>
              ))}
            </div>

            <Button className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group">
              Explore Features
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Monthly Cost</div>
                  <div className="text-2xl font-bold group-hover:text-purple-600 transition-colors duration-300">
                    $247.50
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm hover:text-purple-600 transition-colors duration-300">
                    <span>Compute (12 instances)</span>
                    <span>$89.60</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 transition-colors duration-300">
                    <span>Storage (2.4 TB)</span>
                    <span>$58.40</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 transition-colors duration-300">
                    <span>Functions (1.2M calls)</span>
                    <span>$24.80</span>
                  </div>
                  <div className="flex justify-between text-sm hover:text-purple-600 transition-colors duration-300">
                    <span>Databases (3 instances)</span>
                    <span>$45.20</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground group-hover:text-purple-600 transition-colors duration-300">
                    💡 AI suggests: Optimize 3 underutilized servers to save ~$25/month
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
              className="border-0 bg-background hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer group"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: isVisible ? "slideInUp 0.6s ease-out forwards" : "none",
              }}
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400 hover:scale-125 transition-transform duration-300"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-sm group-hover:text-purple-600 transition-colors duration-300">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl p-12 border hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
          <h2 className="text-3xl font-bold mb-4 group-hover:text-purple-600 transition-colors duration-300">
            Ready to build something amazing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto group-hover:text-foreground transition-colors duration-300">
            Join thousands of developers who trust UWS to power their applications. Start with our free tier and scale
            as you grow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 hover:scale-110 transition-all duration-300 hover:shadow-xl group"
              asChild
            >
              <a href="/dashboard">
                Get Started Free
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 bg-transparent hover:scale-110 transition-all duration-300 hover:shadow-lg"
            >
              Talk to Sales
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 group-hover:text-purple-600 transition-colors duration-300">
            No credit card required • Free tier includes $100 credits
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0 group">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <CloudIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold group-hover:text-purple-600 transition-colors duration-300">
                Unicorn Web Services
              </span>
            </div>

            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">
                Privacy
              </a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">
                Terms
              </a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">
                Support
              </a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">
                Status
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 Unicorn Web Services. All rights reserved.
          </div>
        </div>
      </footer>

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
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
