"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DocumentTextIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"

interface InvoiceCardProps {
  id: string
  date: string
  amount: number
  status: string
  dueDate: string
}

export function InvoiceCard({ id, date, amount, status, dueDate }: InvoiceCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{id}</h3>
              <p className="text-sm text-muted-foreground">
                {status === "Current" ? "Due" : "Paid"} on {dueDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
              <Badge
                variant={status === "Paid" ? "secondary" : "default"}
                className={
                  status === "Paid"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }
              >
                {status}
              </Badge>
            </div>
            {status === "Paid" && (
              <Button variant="outline">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
