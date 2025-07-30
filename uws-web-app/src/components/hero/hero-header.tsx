import { Button } from "@/components/ui/button"
import { CloudIcon } from "@heroicons/react/24/outline"
import { ThemeToggle } from "../theme-toggle"

interface HeroHeaderProps {
  isVisible: boolean
}

export function HeroHeader({ isVisible }: HeroHeaderProps) {
  return (
    <header
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2 group hover:no-underline">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <CloudIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Unicorn Web Services</span>
          </a>
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
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 transition-all duration-200 hover:shadow-lg" asChild>
              <a href="/register">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
