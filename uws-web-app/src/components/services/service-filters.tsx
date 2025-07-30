"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ServiceFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
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

export function ServiceFilters({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
}: ServiceFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="h-8"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Status</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status.id}
              variant={selectedStatus === status.id ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(status.id)}
              className="h-8"
            >
              {status.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
