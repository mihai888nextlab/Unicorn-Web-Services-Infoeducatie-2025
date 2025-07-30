"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type React from "react"

interface DraggableCardProps {
  id: string
  children: React.ReactNode
}

export function DraggableCard({ id, children }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`transition-all duration-200 ${
        isDragging ? "scale-105 shadow-2xl ring-2 ring-purple-500 ring-opacity-50" : ""
      }`}
    >
      {children}
    </div>
  )
}
