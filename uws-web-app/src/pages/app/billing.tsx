"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArchiveBoxIcon,
  ServerIcon,
  BoltIcon,
  CircleStackIcon,
  InformationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { ResizableLayout } from "../../components/layout/resizable-layout"
import { CurrentBillSummary } from "../../components/billing/current-bill-summary"
import { UsageCard } from "../../components/billing/usage-card"
import { InvoiceCard } from "../../components/billing/invoice-card"
import { AIChatbot } from "../../components/ai-chatbot"

export default function BillingPage() {
  const currentUsage = [
    {
      service: "Storage",
      icon: ArchiveBoxIcon,
      usage: "2.4 TB",
      limit: "5 TB",
      cost: 58.4,
      percentage: 48,
      description: "Files, backups, and data storage",
    },
    {
      service: "Compute",
      icon: ServerIcon,
      usage: "12 servers",
      limit: "20 servers",
      cost: 89.6,
      percentage: 60,
      description: "Virtual machines and containers",
    },
    {
      service: "Functions",
      icon: BoltIcon,
      usage: "1.2M calls",
      limit: "2M calls",
      cost: 24.8,
      percentage: 60,
      description: "Serverless function executions",
    },
    {
      service: "Database",
      icon: CircleStackIcon,
      usage: "3 databases",
      limit: "5 databases",
      cost: 45.2,
      percentage: 60,
      description: "Managed database instances",
    },
  ]

  const recentInvoices = [
    {
      id: "January 2024",
      date: "Jan 1, 2024",
      amount: 247.5,
      status: "Current",
      dueDate: "Jan 31, 2024",
    },
    {
      id: "December 2023",
      date: "Dec 1, 2023",
      amount: 234.8,
      status: "Paid",
      dueDate: "Dec 31, 2023",
    },
    {
      id: "November 2023",
      date: "Nov 1, 2023",
      amount: 198.2,
      status: "Paid",
      dueDate: "Nov 30, 2023",
    },
  ]

  const totalCurrentCost = currentUsage.reduce((sum, service) => sum + service.cost, 0)

  return (
    <>
      <ResizableLayout currentPage="billing">
        <div className="p-6 h-full overflow-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Billing</h2>
            <p className="text-muted-foreground text-lg">Keep track of your usage and costs</p>
          </div>

          <CurrentBillSummary totalCost={totalCurrentCost} />

          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="usage">Current Usage</TabsTrigger>
              <TabsTrigger value="history">Billing History</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="tips">Save Money</TabsTrigger>
            </TabsList>

            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentUsage.map((service, index) => (
                  <UsageCard
                    key={index}
                    service={service.service}
                    icon={service.icon}
                    usage={service.usage}
                    limit={service.limit}
                    cost={service.cost}
                    percentage={service.percentage}
                    description={service.description}
                  />
                ))}
              </div>

              <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Good news!</h4>
                      <p className="text-blue-800 dark:text-blue-200 mt-1">
                        You're using your resources efficiently. Your current usage is well within limits and costs are
                        predictable.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                {recentInvoices.map((invoice, index) => (
                  <InvoiceCard
                    key={index}
                    id={invoice.id}
                    date={invoice.date}
                    amount={invoice.amount}
                    status={invoice.status}
                    dueDate={invoice.dueDate}
                  />
                ))}
              </div>

              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Need older invoices?</h3>
                  <p className="text-muted-foreground mb-4">
                    We keep all your billing history. Contact support to get invoices older than 3 months.
                  </p>
                  <Button variant="outline">Contact Support</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResizableLayout>
      <AIChatbot />
    </>
  )
}
