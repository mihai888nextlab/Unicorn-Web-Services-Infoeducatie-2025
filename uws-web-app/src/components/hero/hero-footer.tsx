"use client"

import { CloudIcon } from "@heroicons/react/24/outline"

export function HeroFooter() {
  return (
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
  )
}
