"use client"

import { useState } from "react"
import { ResizableLayout } from "../../components/layout/resizable-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ServicesHeader } from "../../components/services/services-header"
import { ServicesGrid } from "../../components/services/services-grid"
import { AIChatbot } from "../../components/ai-chatbot"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  return (
    <AuthGuard>
    <>
      <ResizableLayout currentPage="services">
        <div className="p-6 h-full overflow-auto">
          <ServicesHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          <ServicesGrid
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            viewMode={viewMode}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </ResizableLayout>
      <AIChatbot />
    </>
    </AuthGuard>
  )
}
