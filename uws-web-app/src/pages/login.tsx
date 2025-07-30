
import { LoginForm } from "@/components/auth/login-form"
import { HeroHeader } from "@/components/hero/hero-header"
import { useState } from "react"

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(true)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroHeader isVisible={isVisible} />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-card border border-muted/40 backdrop-blur-lg">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Sign in to your account</h1>
          <LoginForm />
          <div className="mt-6 text-center text-muted-foreground text-sm">
            Don&apos;t have an account? <a href="/register" className="text-primary underline">Register</a>
          </div>
        </div>
      </main>
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0 group">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {/* You can use your logo here if desired */}
              </div>
              <span className="font-semibold group-hover:text-purple-600 transition-colors duration-300">
                Unicorn Web Services
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">Privacy</a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">Terms</a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">Support</a>
              <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:scale-105">Status</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 Unicorn Web Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}