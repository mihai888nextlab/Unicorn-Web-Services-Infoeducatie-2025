import { useState } from "react";
import type { ReactElement } from "react";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import type { NextPageWithLayout } from "../_app";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AddCardDialog } from "@/components/dashboard/add-card-dialog";
import { TemplateSelector } from "@/components/dashboard/template-selector";
import { SortableCard } from "@/components/dashboard/sortable-card";
import { SortableGrid } from "@/components/dashboard/sortable-grid";
import { SortableDragOverlay } from "@/components/dashboard/sortable-drag-overlay";
import { StatsCard } from "@/components/dashboard/cards/stats-card";
import { ServiceStatusCard } from "@/components/dashboard/cards/service-status-card";
import { QuickActionsCard } from "@/components/dashboard/cards/quick-actions-card";
import { ChartCard } from "@/components/dashboard/cards/chart-card";
import { RecentActivityCard } from "@/components/dashboard/cards/recent-activity-card";
import { ServicesGridCard } from "@/components/dashboard/cards/services-grid-card";
import { QuickStatsCard } from "@/components/dashboard/cards/quick-stats-card";
import { StorageCard } from "@/components/dashboard/cards/storage-card";
import { DatabaseCard } from "@/components/dashboard/cards/database-card";
import { ComputeCard } from "@/components/dashboard/cards/compute-card";
import { LambdaCard } from "@/components/dashboard/cards/lambda-card";
import { QueueCard } from "@/components/dashboard/cards/queue-card";
import { SecretsCard } from "@/components/dashboard/cards/secrets-card";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { layoutStyles } from "@/components/dashboard/dashboard-templates";
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
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

const Dashboard: NextPageWithLayout = () => {
  const { user } = useAuth();

  const { cards, removeCard, currentLayout, sortCards } = useDashboard();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      sortCards(active.id as string, over.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  function renderCard(card: any) {
    switch (card.type) {
      case "stats":
        // Provide required props for StatsCard
        return (
          <SortableCard key={card.id} id={card.id}>
            <StatsCard
              id={card.id}
              title={card.title}
              value={card.config?.value || "0"}
              change={card.config?.change}
              changeType={card.config?.changeType}
              icon={card.config?.icon || ServerIcon}
              iconColor={card.config?.iconColor || "text-blue-500"}
              iconBg={card.config?.iconBg || "bg-blue-100"}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "service-status":
        return (
          <SortableCard key={card.id} id={card.id}>
            <ServiceStatusCard
              id={card.id}
              title={card.title}
              services={
                card.config?.services || [
                  { name: "Compute", status: "online", icon: ServerIcon },
                  { name: "Storage", status: "online", icon: ArchiveBoxIcon },
                  { name: "Functions", status: "warning", icon: BoltIcon },
                  { name: "Database", status: "online", icon: CircleStackIcon },
                ]
              }
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "quick-actions":
        return (
          <SortableCard key={card.id} id={card.id}>
            <QuickActionsCard
              id={card.id}
              title={card.title}
              actions={
                card.config?.actions || [
                  {
                    label: "Create Resource",
                    icon: PlusIcon,
                    onClick: () => console.log("Create"),
                  },
                  {
                    label: "View Logs",
                    icon: ChartBarIcon,
                    onClick: () => console.log("Logs"),
                  },
                  {
                    label: "Settings",
                    icon: CogIcon,
                    onClick: () => console.log("Settings"),
                  },
                ]
              }
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "chart":
        return (
          <SortableCard key={card.id} id={card.id}>
            <ChartCard
              id={card.id}
              title={card.title}
              chartType={card.config?.chartType || "line"}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "recent-activity":
        return (
          <SortableCard key={card.id} id={card.id}>
            <RecentActivityCard
              id={card.id}
              title={card.title}
              activities={
                card.config?.activities || [
                  {
                    id: "1",
                    action: "Deployed",
                    resource: "web-app-prod",
                    timestamp: "2m ago",
                    status: "success",
                  },
                  {
                    id: "2",
                    action: "Scaled",
                    resource: "api-service",
                    timestamp: "5m ago",
                    status: "info",
                  },
                  {
                    id: "3",
                    action: "Backup failed",
                    resource: "database-1",
                    timestamp: "12m ago",
                    status: "error",
                  },
                ]
              }
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      // Service Cards
      case "storage-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <StorageCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "database-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <DatabaseCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "compute-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <ComputeCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "lambda-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <LambdaCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "queue-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <QueueCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      case "secrets-service":
        return (
          <SortableCard key={card.id} id={card.id}>
            <SecretsCard
              id={card.id}
              title={card.title}
              size={card.size}
              onRemove={removeCard}
            />
          </SortableCard>
        );
      default:
        return null;
    }
  }

  // Get sorted cards and their IDs for the sortable context
  const sortedCards = cards.sort((a: any, b: any) => a.position - b.position);
  const cardIds = sortedCards.map((card: any) => card.id);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="flex items-center space-x-3">
              <TemplateSelector />
              <AddCardDialog />
            </div>
          </div>
          <p className="text-muted-foreground">
            Your personalized cloud infrastructure overview
          </p>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Sortable Grid with Real-time Reordering */}
          <SortableGrid
            items={cardIds}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {sortedCards.map((card: any) => renderCard(card))}
          </SortableGrid>

          {/* Enhanced Drag Overlay */}
          <SortableDragOverlay activeId={activeId} />
        </DndContext>
        {cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No cards added yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your dashboard by adding some cards
            </p>
            <AddCardDialog />
          </div>
        )}
      </div>
    </div>
  );
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <ResizableLayout currentPage="dashboard">{page}</ResizableLayout>;
};

export default Dashboard;
