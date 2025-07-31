"use client"

import { useState } from "react"
import type { ReactElement } from "react"
import { ResizableLayout } from "../../components/layout/resizable-layout"
import { ServicesHeader } from "../../components/services/services-header"
import { ServicesGrid } from "../../components/services/services-grid"
import { AIChatbot } from "../../components/ai-chatbot"
import type { NextPageWithLayout } from "../_app"

const ServicesPage: NextPageWithLayout = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  return (
    <>
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
      <AIChatbot />
    </>
  )
};

ServicesPage.getLayout = function getLayout(page: ReactElement) {
  return <ResizableLayout currentPage="services">{page}</ResizableLayout>;
};

export default ServicesPage;
