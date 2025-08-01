"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  HomeIcon,
  ServerIcon,
  ChartBarIcon,
  CreditCardIcon,
  UsersIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  KeyIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  BoltIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

interface AppSidebarProps {
  currentPage?: string
}

export function AppSidebar({ currentPage }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('[data-panel-id="sidebar"]')
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width
        setIsCollapsed(width < 120)
      }
    }

    // Initial check
    handleResize()

    // Listen for resize events
    window.addEventListener("resize", handleResize)

    // Use MutationObserver to detect panel size changes
    const observer = new MutationObserver(handleResize)
    const sidebar = document.querySelector('[data-panel-id="sidebar"]')
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["style"] })
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [])

  const navItems = [
    { href: "/app", icon: HomeIcon, label: "Dashboard", id: "dashboard" },
    { href: "/app/services", icon: ServerIcon, label: "Services", id: "services" },
    { href: "/app/monitoring", icon: ChartBarIcon, label: "Monitoring", id: "monitoring" },
    { href: "/app/billing", icon: CreditCardIcon, label: "Billing", id: "billing" },
    { href: "/app/iam", icon: UsersIcon, label: "IAM", id: "iam" },
    { href: "/app/settings", icon: Cog6ToothIcon, label: "Settings", id: "settings" },
  ]

  const SidebarButton = ({ item }: { item: (typeof navItems)[0] }) => {
    const [currentPath, setCurrentPath] = useState("")
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      // Only set current path on client side to avoid hydration mismatch
      setMounted(true)
      if (typeof window !== "undefined") {
        setCurrentPath(window.location.pathname)
      }
    }, [])
    
    const IconComponent = item.icon
    const isActive = currentPage === item.id

    const button = (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full transition-all duration-200 ${
          isCollapsed
            ? "justify-center p-0 h-12 w-12 mx-auto rounded-lg"
            : "justify-start hover:scale-105 px-3 rounded-md"
        }`}
        size={isCollapsed ? "icon" : "sm"}
        asChild
      >
        <a href={item.href} className="flex items-center w-full">
          <IconComponent className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"} flex-shrink-0`} />
          {!isCollapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {/* Always show down arrow for Services when not collapsed */}
              {item.id === "services" && (
                <ChevronDownIcon className="w-4 h-4 ml-auto opacity-80" />
              )}
            </>
          )}
        </a>
      </Button>
    )

    // Add sub-navigation for Services
    if (!isCollapsed && item.id === "services" && isActive) {
      // Add icons for each service
      const allServices = [
        { name: "Storage", href: "/app/services/storage", icon: CloudIcon },
        { name: "Database", href: "/app/services/database", icon: CircleStackIcon },
        { name: "Compute", href: "/app/services/compute", icon: CpuChipIcon },
        { name: "Lambda", href: "/app/services/lambda", icon: BoltIcon },
        { name: "Queue", href: "/app/services/queue", icon: QueueListIcon },
        { name: "Secrets Manager", href: "/app/services/secrets", icon: KeyIcon },
      ]
      return (
        <div>
          {button}
          <div className="ml-8 mt-1 flex flex-col border-l border-border/40 pl-3 gap-1 max-h-80 overflow-y-auto pr-2">
            {allServices.map((service) => {
              const ServiceIcon = service.icon
              const isSubActive = mounted && currentPath === service.href
              return (
                <a
                  key={service.href}
                  href={service.href}
                  className={`flex items-center gap-2 text-sm transition-colors py-1 px-2 rounded-md hover:bg-accent/30 ${
                    isSubActive
                      ? "bg-accent/40 text-foreground border border-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <ServiceIcon className="w-4 h-4 flex-shrink-0 opacity-80" />
                  {service.name}
                </a>
              )
            })}
          </div>
        </div>
      )
    }

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }

  return (
    <aside
      className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r"
      data-panel-id="sidebar"
    >
      <nav className={`p-2 space-y-2 h-full overflow-hidden ${isCollapsed ? "px-2 py-4" : "px-4"}`}>
        {/* Navigation items */}
        <div className={`space-y-${isCollapsed ? "2" : "1"}`}>
          {navItems.map((item) => (
            <SidebarButton key={item.id} item={item} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
