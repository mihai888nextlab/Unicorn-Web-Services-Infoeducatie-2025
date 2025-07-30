"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(20) // Default 20%

  // Load saved width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebar-width")
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth))
    }
  }, [])

  // Save width to localStorage whenever it changes
  const handleSetSidebarWidth = (width: number) => {
    setSidebarWidth(width)
    localStorage.setItem("sidebar-width", width.toString())
  }

  return (
    <SidebarContext.Provider value={{ sidebarWidth, setSidebarWidth: handleSetSidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
