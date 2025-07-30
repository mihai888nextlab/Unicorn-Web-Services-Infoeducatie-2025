"use client"

import { TestimonialCard } from "./testimonial-card"

interface TestimonialsSectionProps {
  isVisible: boolean
}

export function TestimonialsSection({ isVisible }: TestimonialsSectionProps) {
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

  return (
    <section className="container mx-auto px-6 py-20 bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
          Trusted by teams worldwide
        </h2>
        <p className="text-lg text-muted-foreground">See what developers and CTOs are saying about UWS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            role={testimonial.role}
            content={testimonial.content}
            rating={testimonial.rating}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>
    </section>
  )
}
