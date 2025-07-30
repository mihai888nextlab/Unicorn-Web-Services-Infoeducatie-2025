"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArchiveBoxIcon, FolderIcon, DocumentIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { DashboardProvider } from "@/components/dashboard/dashboard-context"
import { Inter } from "next/font/google"
import { ResizableLayout } from "@/components/layout/resizable-layout"

const inter = Inter({ subsets: ["latin"] })

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <DashboardProvider>
          <div className={inter.className}>{children}</div>
        </DashboardProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}
// Dummy data for buckets and objects
const demoBuckets = [
  {
    name: "my-app-uploads",
    region: "eu-central-1",
    createdAt: "2024-01-10",
    objects: [
      { key: "images/logo.png", size: 20480, lastModified: "2025-07-01" },
      { key: "docs/readme.pdf", size: 102400, lastModified: "2025-06-15" },
      { key: "backups/2025-07-01.zip", size: 5242880, lastModified: "2025-07-01" },
    ],
  },
  {
    name: "static-assets",
    region: "eu-west-1",
    createdAt: "2023-11-22",
    objects: [
      { key: "index.html", size: 4096, lastModified: "2025-07-20" },
      { key: "css/styles.css", size: 8192, lastModified: "2025-07-18" },
    ],
  },
]

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  if (bytes > 1024)
    return (bytes / 1024).toFixed(2) + " KB"
  return bytes + " B"
}

export default function StoragePage() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(demoBuckets[0]?.name || null)
  const [search, setSearch] = useState("")
  const bucket = demoBuckets.find(b => b.name === selectedBucket)

  return (
    <AppProviders>
      <ResizableLayout currentPage="services">
        <div className="p-6 h-full flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <ArchiveBoxIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">S3 Storage</h1>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm"><ArrowPathIcon className="w-4 h-4 mr-1" />Refresh</Button>
              <Button size="sm">+ New Bucket</Button>
            </div>
          </div>
          <div className="flex gap-6">
            {/* Buckets List */}
            <div className="w-64 min-w-[200px]">
              <h2 className="font-semibold mb-2 text-sm text-muted-foreground">Buckets</h2>
              <div className="flex flex-col gap-1">
                {demoBuckets.map(b => (
                  <Card
                    key={b.name}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer border transition-colors ${selectedBucket === b.name ? "border-primary bg-accent/40" : "hover:bg-accent/20"}`}
                    onClick={() => setSelectedBucket(b.name)}
                  >
                    <FolderIcon className="w-5 h-5 text-primary/80" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.region}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            {/* Bucket Details & Objects */}
            <div className="flex-1 min-w-0">
              {bucket ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">{bucket.name}</h2>
                    <span className="text-xs text-muted-foreground">Region: {bucket.region}</span>
                    <span className="text-xs text-muted-foreground">Created: {bucket.createdAt}</span>
                    <Button variant="outline" size="sm" className="ml-auto">Upload</Button>
                  </div>
                  <Input
                    placeholder="Search objects..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <div className="rounded-lg border bg-background overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left font-medium px-4 py-2">Object</th>
                          <th className="text-left font-medium px-4 py-2">Size</th>
                          <th className="text-left font-medium px-4 py-2">Last Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bucket.objects.filter(obj => obj.key.toLowerCase().includes(search.toLowerCase())).map(obj => (
                          <tr key={obj.key} className="border-b last:border-0 hover:bg-accent/20 transition-colors">
                            <td className="px-4 py-2 flex items-center gap-2">
                              <DocumentIcon className="w-4 h-4 text-muted-foreground" />
                              {obj.key}
                            </td>
                            <td className="px-4 py-2">{formatSize(obj.size)}</td>
                            <td className="px-4 py-2">{obj.lastModified}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bucket.objects.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">No objects in this bucket.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Select a bucket to view its contents.</div>
              )}
            </div>
          </div>
        </div>
      </ResizableLayout>
    </AppProviders>
  )
}
