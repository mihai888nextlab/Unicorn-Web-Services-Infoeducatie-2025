"use client"

import { Button } from "@/components/ui/button"
import { CloudIcon, BellIcon, MagnifyingGlassIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"
import { ThemeToggle } from "../theme-toggle"

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <CloudIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Unicorn Web Services</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <ThemeToggle />
          <Button variant="outline" size="icon">
            <Cog6ToothIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
