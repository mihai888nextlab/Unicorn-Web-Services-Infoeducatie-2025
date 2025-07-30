"use client"

import { useState, useEffect } from "react"
import type { ReactElement } from "react"
import { ResizableLayout } from "../../components/layout/resizable-layout"
import { SettingsSidebar } from "../../components/settings/settings-sidebar"
import { ProfileSection } from "../../components/settings/profile-section"
import { NotificationsSection } from "../../components/settings/notifications-section"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { AIChatbot } from "../../components/ai-chatbot"
import type { NextPageWithLayout } from "../_app"

const SettingsPage: NextPageWithLayout = () => {
  const [activeSection, setActiveSection] = useState("profile")
  const [settingsSidebarWidth, setSettingsSidebarWidth] = useState(25)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    billing: true,
    security: true,
    maintenance: false,
  })

  // Load saved settings sidebar width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem("settings-sidebar-width")
    if (savedWidth) {
      setSettingsSidebarWidth(Number(savedWidth))
    }
  }, [])

  const handleSettingsSidebarResize = (size: number) => {
    setSettingsSidebarWidth(size)
    localStorage.setItem("settings-sidebar-width", size.toString())
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />
      case "notifications":
        return <NotificationsSection notifications={notifications} onNotificationChange={handleNotificationChange} />
      default:
        return <ProfileSection />
    }
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Settings Sidebar Panel - Uses persisted width */}
        <ResizablePanel
          defaultSize={settingsSidebarWidth}
          minSize={6}
          maxSize={35}
          onResize={handleSettingsSidebarResize}
        >
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Settings Content Panel */}
        <ResizablePanel defaultSize={100 - settingsSidebarWidth} minSize={65}>
          <main className="p-8 h-full overflow-auto">{renderContent()}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
      <AIChatbot />
    </>
  )
};

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <ResizableLayout currentPage="settings">{page}</ResizableLayout>;
};

export default SettingsPage;
