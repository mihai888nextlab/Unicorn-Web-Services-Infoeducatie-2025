"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline"
import { FilterSortModal } from "./filter-sort-modal"

interface ServicesHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (order: "asc" | "desc") => void
}

export function ServicesHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: ServicesHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Services</h1>
          <p className="text-muted-foreground">Manage your cloud infrastructure</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Service
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <FilterSortModal
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            sortOrder={sortOrder}
            onSortOrderChange={onSortOrderChange}
          />

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none border-r"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <ListBulletIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
