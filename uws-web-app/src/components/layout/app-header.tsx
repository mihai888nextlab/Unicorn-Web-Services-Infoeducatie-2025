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
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
