"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

interface SettingsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('[data-panel-id="settings-sidebar"]')
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width
        setIsCollapsed(width < 120) // Collapse when width is less than 120px
      }
    }

    // Initial check
    handleResize()

    // Listen for resize events
    window.addEventListener("resize", handleResize)

    // Use MutationObserver to detect panel size changes
    const observer = new MutationObserver(handleResize)
    const sidebar = document.querySelector('[data-panel-id="settings-sidebar"]')
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["style"] })
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [])

  const settingsNavigation = [
    { id: "profile", name: "Profile", icon: UserCircleIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "billing", name: "Billing", icon: CreditCardIcon },
    { id: "api", name: "API Keys", icon: KeyIcon },
    { id: "preferences", name: "Preferences", icon: Cog6ToothIcon },
    { id: "appearance", name: "Appearance", icon: PaintBrushIcon },
  ]

  const SettingsButton = ({ item }: { item: (typeof settingsNavigation)[0] }) => {
    const IconComponent = item.icon
    const isActive = activeSection === item.id

    const button = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full transition-all duration-200 ${
          isCollapsed
            ? "justify-center p-0 h-12 w-12 mx-auto rounded-lg"
            : "justify-start hover:scale-105 px-3 rounded-md"
        }`}
        size={isCollapsed ? "icon" : "sm"}
        onClick={() => onSectionChange(item.id)}
      >
        <IconComponent className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"} flex-shrink-0`} />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </Button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }

  return (
    <aside className="h-full bg-muted/30 border-r" data-panel-id="settings-sidebar">
      <div className={`p-2 h-full overflow-hidden ${isCollapsed ? "px-2 py-4" : "px-4"}`}>
        {/* Settings navigation items */}
        <nav className={`space-y-${isCollapsed ? "2" : "1"}`}>
          {settingsNavigation.map((item) => (
            <SettingsButton key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
