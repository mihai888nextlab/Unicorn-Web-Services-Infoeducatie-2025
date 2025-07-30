import { useState } from "react"
import { RegisterForm } from "@/components/ui/register-form"
import { HeroHeader } from "@/components/hero/hero-header"
import { HeroFooter } from "@/components/hero/hero-footer"

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(true)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroHeader isVisible={isVisible} />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </main>
      <HeroFooter />
    </div>
  )
}
