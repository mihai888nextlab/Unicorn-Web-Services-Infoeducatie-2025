"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline"

interface FilterSortModalProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (order: "asc" | "desc") => void
}

const categories = [
  { id: "all", name: "All Services", count: 10 },
  { id: "compute", name: "Compute", count: 3 },
  { id: "storage", name: "Storage", count: 2 },
  { id: "database", name: "Database", count: 2 },
  { id: "networking", name: "Networking", count: 1 },
  { id: "security", name: "Security", count: 2 },
]

const statuses = [
  { id: "all", name: "All Status" },
  { id: "active", name: "Active" },
  { id: "inactive", name: "Inactive" },
  { id: "warning", name: "Warning" },
]

const sortOptions = [
  { id: "name", name: "Name" },
  { id: "cost", name: "Cost" },
  { id: "status", name: "Status" },
  { id: "updated", name: "Last Updated" },
  { id: "category", name: "Category" },
]

export function FilterSortModal({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: FilterSortModalProps) {
  const [open, setOpen] = useState(false)

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0) + (sortBy !== "name" ? 1 : 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative bg-transparent">
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filter & Sort
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter & Sort Services</DialogTitle>
          <DialogDescription>Customize how services are displayed and organized</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium mb-3">Category</h3>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="justify-between h-9"
                >
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-3">Status</h3>
            <div className="grid grid-cols-4 gap-2">
              {statuses.map((status) => (
                <Button
                  key={status.id}
                  variant={selectedStatus === status.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(status.id)}
                  className="h-9"
                >
                  {status.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sort */}
          <div>
            <h3 className="text-sm font-medium mb-3">Sort By</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={sortBy === option.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortChange(option.id)}
                    className="h-9"
                  >
                    {option.name}
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={sortOrder === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortOrderChange("asc")}
                  className="flex-1 h-9"
                >
                  <ArrowsUpDownIcon className="w-4 h-4 mr-2" />
                  Ascending
                </Button>
                <Button
                  variant={sortOrder === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortOrderChange("desc")}
                  className="flex-1 h-9"
                >
                  <ArrowsUpDownIcon className="w-4 h-4 mr-2 rotate-180" />
                  Descending
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reset */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onCategoryChange("all")
                onStatusChange("all")
                onSortChange("name")
                onSortOrderChange("asc")
              }}
            >
              Reset All
            </Button>
            <Button onClick={() => setOpen(false)}>Apply Filters</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
