"use client"

import type React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { useSidebar } from "./sidebar-context"
import { AIChatbot } from "../ai-chatbot"

interface ResizableLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export function ResizableLayout({ children, currentPage }: ResizableLayoutProps) {
  const { sidebarWidth, setSidebarWidth } = useSidebar()

  const handleSidebarResize = (size: number) => {
    setSidebarWidth(size)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar Panel - Uses persisted width */}
        <ResizablePanel defaultSize={sidebarWidth} minSize={13} maxSize={25} onResize={handleSidebarResize}>
          <AppSidebar currentPage={currentPage} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={100 - sidebarWidth} minSize={65}>
          <main className="h-full overflow-auto">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* AI Chatbot - Fixed position overlay */}
      <AIChatbot />
    </div>
  )
}
