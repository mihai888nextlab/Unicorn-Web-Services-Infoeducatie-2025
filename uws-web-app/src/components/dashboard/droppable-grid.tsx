"use client"

import { useDroppable } from "@dnd-kit/core"
import type React from "react"

interface DroppableGridProps {
  id: string
  className: string
  children: React.ReactNode
}

export function DroppableGrid({ id, className, children }: DroppableGridProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? "bg-purple-50 dark:bg-purple-900/10 ring-2 ring-purple-300 ring-dashed rounded-lg" : ""
      } transition-all duration-200`}
    >
      {children}
    </div>
  )
}
