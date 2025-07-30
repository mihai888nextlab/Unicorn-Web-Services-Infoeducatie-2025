"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type React from "react"

interface SortableCardProps {
  id: string
  children: React.ReactNode
}

export function SortableCard({ id, children }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({
    id: id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-all duration-200 ${
        isDragging
          ? "scale-105 shadow-2xl ring-2 ring-purple-500 ring-opacity-50 rotate-2"
          : isSorting
            ? "transition-transform duration-300 ease-out"
            : ""
      }`}
    >
      {children}
    </div>
  )
}
