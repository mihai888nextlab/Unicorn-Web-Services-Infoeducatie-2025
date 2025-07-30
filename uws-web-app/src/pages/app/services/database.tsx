"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, ServerIcon } from "@heroicons/react/24/outline"
import { ResizableLayout } from "@/components/layout/resizable-layout"

export default function DatabasePage() {
  const [tab, setTab] = useState("sql")

  return (
    <AuthGuard>
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="nosql">NoSQL</TabsTrigger>
          </TabsList>
          <TabsContent value="sql">
            <Card className="p-6 flex flex-col gap-4">
              <div className="font-semibold text-lg mb-2 flex items-center gap-2"><ServerIcon className="w-5 h-5" /> SQL Databases</div>
              {/* Example: List of SQL DBs, add new, etc. */}
              <div className="text-muted-foreground">No SQL databases yet.</div>
              <Button size="sm" className="w-fit mt-2"><PlusIcon className="w-4 h-4 mr-1" /> New SQL Database</Button>
            </Card>
          </TabsContent>
          <TabsContent value="nosql">
            <Card className="p-6 flex flex-col gap-4">
              <div className="font-semibold text-lg mb-2 flex items-center gap-2"><ServerIcon className="w-5 h-5" /> NoSQL Databases</div>
              {/* Example: List of NoSQL DBs, add new, etc. */}
              <div className="text-muted-foreground">No NoSQL databases yet.</div>
              <Button size="sm" className="w-fit mt-2"><PlusIcon className="w-4 h-4 mr-1" /> New NoSQL Database</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResizableLayout>
    </AuthGuard>
  )
}
