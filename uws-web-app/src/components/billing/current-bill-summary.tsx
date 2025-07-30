"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDaysIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

interface CurrentBillSummaryProps {
  totalCost: number
}

export function CurrentBillSummary({ totalCost }: CurrentBillSummaryProps) {
  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-800">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Current Month (January 2024)</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">${totalCost.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground">so far</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your bill will be automatically charged on January 31st
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Payment Method Active</span>
            </div>
            <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
              Update Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
