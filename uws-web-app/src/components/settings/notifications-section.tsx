"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface NotificationsSectionProps {
  notifications: Record<string, boolean>
  onNotificationChange: (key: string, value: boolean) => void
}

export function NotificationsSection({ notifications, onNotificationChange }: NotificationsSectionProps) {
  const notificationLabels = {
    email: "Email Notifications",
    push: "Push Notifications",
    sms: "SMS Notifications",
    billing: "Billing Notifications",
    security: "Security Notifications",
    maintenance: "Maintenance Notifications",
  }

  const notificationDescriptions = {
    email: "Receive notifications via email",
    push: "Browser push notifications",
    sms: "SMS text message alerts",
    billing: "Billing and payment updates",
    security: "Security and login alerts",
    maintenance: "Scheduled maintenance notices",
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose how and when you want to be notified.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label className="text-base">{notificationLabels[key as keyof typeof notificationLabels]}</Label>
                  <p className="text-sm text-muted-foreground">
                    {notificationDescriptions[key as keyof typeof notificationDescriptions]}
                  </p>
                </div>
                <Switch checked={value} onCheckedChange={(checked) => onNotificationChange(key, checked)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
