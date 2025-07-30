"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { dashboardTemplates, layoutStyles, type DashboardTemplate } from "../dashboard/dashboard-templates"

export interface DashboardCard {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large" | "wide"
  position: number
  config?: Record<string, any>
}

interface DashboardContextType {
  cards: DashboardCard[]
  currentTemplate: DashboardTemplate | null
  currentLayout: keyof typeof layoutStyles
  addCard: (card: Omit<DashboardCard, "id" | "position">) => void
  removeCard: (id: string) => void
  updateCard: (id: string, updates: Partial<DashboardCard>) => void
  reorderCards: (cards: DashboardCard[]) => void
  moveCard: (activeId: string, overId: string) => void
  sortCards: (activeId: string, overId: string) => void
  setTemplate: (template: DashboardTemplate) => void
  setLayout: (layout: keyof typeof layoutStyles) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<DashboardCard[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<DashboardTemplate | null>(null)
  const [currentLayout, setCurrentLayout] = useState<keyof typeof layoutStyles>("grid")

  // Load saved dashboard from localStorage on mount
  useEffect(() => {
    const savedDashboard = localStorage.getItem("dashboard-layout")
    const savedTemplate = localStorage.getItem("dashboard-template")
    const savedLayout = localStorage.getItem("dashboard-layout-style")

    if (savedLayout && savedLayout in layoutStyles) {
      setCurrentLayout(savedLayout as keyof typeof layoutStyles)
    }

    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate)
        setCurrentTemplate(template)
      } catch (error) {
        console.error("Failed to load dashboard template:", error)
      }
    }

    if (savedDashboard) {
      try {
        setCards(JSON.parse(savedDashboard))
      } catch (error) {
        console.error("Failed to load dashboard layout:", error)
        setDefaultTemplate()
      }
    } else {
      setDefaultTemplate()
    }
  }, [])

  // Save dashboard to localStorage whenever cards change
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("dashboard-layout", JSON.stringify(cards))
    }
  }, [cards])

  // Save template and layout to localStorage
  useEffect(() => {
    if (currentTemplate) {
      localStorage.setItem("dashboard-template", JSON.stringify(currentTemplate))
    }
  }, [currentTemplate])

  useEffect(() => {
    localStorage.setItem("dashboard-layout-style", currentLayout)
  }, [currentLayout])

  const setDefaultTemplate = () => {
    const defaultTemplate = dashboardTemplates[0] // Classic template
    setCurrentTemplate(defaultTemplate)
    setCards(defaultTemplate.cards)
    setCurrentLayout(defaultTemplate.layout as keyof typeof layoutStyles)
  }

  const addCard = (card: Omit<DashboardCard, "id" | "position">) => {
    const newCard: DashboardCard = {
      ...card,
      id: `${card.type}-${Date.now()}`,
      position: cards.length,
    }
    setCards((prev) => [...prev, newCard])
  }

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
  }

  const updateCard = (id: string, updates: Partial<DashboardCard>) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...updates } : card)))
  }

  const reorderCards = (newCards: DashboardCard[]) => {
    setCards(newCards)
  }

  const moveCard = (activeId: string, overId: string) => {
    setCards((cards) => {
      const activeIndex = cards.findIndex((card) => card.id === activeId)
      const overIndex = cards.findIndex((card) => card.id === overId)

      if (activeIndex === -1 || overIndex === -1) {
        return cards
      }

      const newCards = [...cards]
      const [movedCard] = newCards.splice(activeIndex, 1)
      newCards.splice(overIndex, 0, movedCard)

      // Update positions
      return newCards.map((card, index) => ({
        ...card,
        position: index,
      }))
    })
  }

  const sortCards = (activeId: string, overId: string) => {
    setCards((cards) => {
      const activeIndex = cards.findIndex((card) => card.id === activeId)
      const overIndex = cards.findIndex((card) => card.id === overId)

      if (activeIndex === -1 || overIndex === -1) {
        return cards
      }

      // Use arrayMove for smooth sortable reordering
      const newCards = arrayMove(cards, activeIndex, overIndex)

      // Update positions
      return newCards.map((card, index) => ({
        ...card,
        position: index,
      }))
    })
  }

  const setTemplate = (template: DashboardTemplate) => {
    setCurrentTemplate(template)
    setCards(template.cards)
    setCurrentLayout(template.layout as keyof typeof layoutStyles)
  }

  const setLayout = (layout: keyof typeof layoutStyles) => {
    setCurrentLayout(layout)
  }

  return (
    <DashboardContext.Provider
      value={{
        cards,
        currentTemplate,
        currentLayout,
        addCard,
        removeCard,
        updateCard,
        reorderCards,
        moveCard,
        sortCards,
        setTemplate,
        setLayout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
