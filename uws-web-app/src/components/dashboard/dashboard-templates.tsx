"use client"

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  layout: "grid" | "masonry" | "rows" | "compact"
  cards: Array<{
    id: string
    type: string
    title: string
    size: "small" | "medium" | "large" | "wide"
    position: number
    config?: Record<string, any>
  }>
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: "classic",
    name: "Classic Dashboard",
    description: "Traditional grid layout with service cards and stats",
    layout: "grid",
    cards: [
      {
        id: "services-grid",
        type: "services-grid",
        title: "Cloud Services",
        size: "wide",
        position: 0,
      },
      {
        id: "quick-stats",
        type: "quick-stats",
        title: "Quick Stats",
        size: "wide",
        position: 1,
      },
    ],
  },
  {
    id: "executive",
    name: "Executive Overview",
    description: "High-level metrics and key performance indicators",
    layout: "compact",
    cards: [
      {
        id: "stats-resources",
        type: "stats",
        title: "Active Resources",
        size: "small",
        position: 0,
        config: { value: "47", icon: "server", iconColor: "text-blue-600", iconBg: "bg-blue-100" },
      },
      {
        id: "stats-health",
        type: "stats",
        title: "Health Score",
        size: "small",
        position: 1,
        config: { value: "98%", icon: "chart", iconColor: "text-green-600", iconBg: "bg-green-100" },
      },
      {
        id: "stats-cost",
        type: "stats",
        title: "Monthly Cost",
        size: "small",
        position: 2,
        config: { value: "$247.50", icon: "credit-card", iconColor: "text-purple-600", iconBg: "bg-purple-100" },
      },
      {
        id: "stats-security",
        type: "stats",
        title: "Security Score",
        size: "small",
        position: 3,
        config: { value: "A+", icon: "shield", iconColor: "text-orange-600", iconBg: "bg-orange-100" },
      },
      {
        id: "usage-chart",
        type: "chart",
        title: "Usage Overview",
        size: "large",
        position: 4,
        config: { chartType: "line" },
      },
      {
        id: "recent-activity",
        type: "recent-activity",
        title: "Recent Activity",
        size: "medium",
        position: 5,
      },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring Focus",
    description: "Detailed monitoring and service status overview",
    layout: "rows",
    cards: [
      {
        id: "service-status",
        type: "service-status",
        title: "Service Status",
        size: "wide",
        position: 0,
      },
      {
        id: "performance-chart",
        type: "chart",
        title: "Performance Metrics",
        size: "large",
        position: 1,
        config: { chartType: "area" },
      },
      {
        id: "alerts",
        type: "recent-activity",
        title: "Active Alerts",
        size: "medium",
        position: 2,
      },
    ],
  },
]

export const layoutStyles = {
  grid: {
    className: "grid grid-cols-4 gap-6 auto-rows-[200px]",
    description: "4-column responsive grid",
  },
  compact: {
    className: "grid grid-cols-6 gap-4 auto-rows-[150px]",
    description: "Compact 6-column layout",
  },
  rows: {
    className: "grid grid-cols-3 gap-6 auto-rows-[250px]",
    description: "3-column row-based layout",
  },
  masonry: {
    className: "columns-4 gap-6 space-y-6",
    description: "Masonry-style layout",
  },
}
