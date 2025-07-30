"use client"

import { DragOverlay } from "@dnd-kit/core"
import { useDashboard } from "./dashboard-context"
import { StatsCard } from "./cards/stats-card"
import { ServiceStatusCard } from "./cards/service-status-card"
import { QuickActionsCard } from "./cards/quick-actions-card"
import { ChartCard } from "./cards/chart-card"
import { RecentActivityCard } from "./cards/recent-activity-card"
import { ServicesGridCard } from "./cards/services-grid-card"
import { QuickStatsCard } from "./cards/quick-stats-card"
import {
  ServerIcon,
  ChartBarIcon,
  PlusIcon,
  CogIcon,
  ArchiveBoxIcon,
  BoltIcon,
  CircleStackIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"

interface SortableDragOverlayProps {
  activeId: string | null
}

export function SortableDragOverlay({ activeId }: SortableDragOverlayProps) {
  const { cards } = useDashboard()

  const activeCard = cards.find((card) => card.id === activeId)

  if (!activeCard) return null

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      server: ServerIcon,
      chart: ChartBarIcon,
      "credit-card": CreditCardIcon,
      shield: ShieldCheckIcon,
    }
    return icons[iconName] || ServerIcon
  }

  const renderOverlayCard = (card: any) => {
    switch (card.type) {
      case "services-grid":
        return <ServicesGridCard id={card.id} title={card.title} size={card.size} />

      case "quick-stats":
        return <QuickStatsCard id={card.id} title={card.title} size={card.size} />

      case "stats":
        const IconComponent = getIconComponent(card.config?.icon || "server")
        return (
          <StatsCard
            id={card.id}
            title={card.title}
            value={card.config?.value || "0"}
            change={card.config?.change}
            changeType={card.config?.changeType}
            icon={IconComponent}
            iconColor={card.config?.iconColor || "text-blue-600"}
            iconBg={card.config?.iconBg || "bg-blue-100"}
            size={card.size}
          />
        )

      case "service-status":
        return (
          <ServiceStatusCard
            id={card.id}
            title={card.title}
            services={[
              { name: "Compute", status: "online", icon: ServerIcon },
              { name: "Storage", status: "online", icon: ArchiveBoxIcon },
              { name: "Functions", status: "warning", icon: BoltIcon },
              { name: "Database", status: "online", icon: CircleStackIcon },
            ]}
            size={card.size}
          />
        )

      case "quick-actions":
        return (
          <QuickActionsCard
            id={card.id}
            title={card.title}
            actions={[
              { label: "Create Resource", icon: PlusIcon, onClick: () => {} },
              { label: "View Logs", icon: ChartBarIcon, onClick: () => {} },
              { label: "Settings", icon: CogIcon, onClick: () => {} },
            ]}
            size={card.size}
          />
        )

      case "chart":
        return (
          <ChartCard id={card.id} title={card.title} chartType={card.config?.chartType || "line"} size={card.size} />
        )

      case "recent-activity":
        return (
          <RecentActivityCard
            id={card.id}
            title={card.title}
            activities={[
              { id: "1", action: "Deployed", resource: "web-app-prod", timestamp: "2m ago", status: "success" },
              { id: "2", action: "Scaled", resource: "api-service", timestamp: "5m ago", status: "info" },
            ]}
            size={card.size}
          />
        )

      default:
        return null
    }
  }

  return (
    <DragOverlay>
      <div className="opacity-95 rotate-6 scale-110 shadow-2xl">{renderOverlayCard(activeCard)}</div>
    </DragOverlay>
  )
}
