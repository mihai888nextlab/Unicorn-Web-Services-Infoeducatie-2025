"use client"

import { Button } from "@/components/ui/button"
import { CheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

interface BenefitsSectionProps {
  isVisible: boolean
}

export function BenefitsSection({ isVisible }: BenefitsSectionProps) {
  const benefits = [
    "99.99% uptime SLA",
    "Global edge network",
    "24/7 expert support",
    "Pay-as-you-scale pricing",
    "Enterprise security",
    "One-click deployments",
  ]

  return (
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
  )
}
