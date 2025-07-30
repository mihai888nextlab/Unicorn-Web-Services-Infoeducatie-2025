import { useState } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { HeroHeader } from "@/components/hero/hero-header"
import { HeroFooter } from "@/components/hero/hero-footer"

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(true)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroHeader isVisible={isVisible} />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-card border border-muted/40 backdrop-blur-lg">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Create your account</h1>
          <RegisterForm />
          <div className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account? <a href="/login" className="text-primary underline">Sign in</a>
          </div>
        </div>
      </main>
      <HeroFooter />
    </div>
  )
}
