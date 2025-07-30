"use client"

import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

export function CTASection() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl p-12 border hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
        <h2 className="text-3xl font-bold mb-4 group-hover:text-purple-600 transition-colors duration-300">
          Ready to build something amazing?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto group-hover:text-foreground transition-colors duration-300">
          Join thousands of developers who trust UWS to power their applications. Start with our free tier and scale as
          you grow.
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
  )
}
