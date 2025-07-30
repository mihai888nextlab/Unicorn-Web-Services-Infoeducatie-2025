"use client"

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import type React from "react"

interface SortableGridProps {
  items: string[]
  className: string
  children: React.ReactNode
}

export function SortableGrid({ items, className, children }: SortableGridProps) {
  return (
    <SortableContext items={items} strategy={rectSortingStrategy}>
      <div className={`${className} relative`}>{children}</div>
    </SortableContext>
  )
}
