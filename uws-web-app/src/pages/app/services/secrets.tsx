"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeSlashIcon, PlusIcon, KeyIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { ResizableLayout } from "@/components/layout/resizable-layout"

interface Secret {
  id: string
  name: string
  key: string
}

const initialSecrets: Secret[] = [
  { id: "1", name: "DB_PASSWORD", key: "supersecret123" },
  { id: "2", name: "API_KEY", key: "sk-abcdefg-123456" },
]

export default function SecretsManagerPage() {
  const [secrets, setSecrets] = useState<Secret[]>(initialSecrets)
  const [showSecret, setShowSecret] = useState<{ [id: string]: boolean }>({})
  const [newName, setNewName] = useState("")
  const [newKey, setNewKey] = useState("")
  const [adding, setAdding] = useState(false)

  const handleAddSecret = () => {
    if (!newName.trim() || !newKey.trim()) return
    setSecrets([
      ...secrets,
      { id: Date.now().toString(), name: newName.trim(), key: newKey.trim() },
    ])
    setNewName("")
    setNewKey("")
    setAdding(false)
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Secrets Manager</h1>
          <Button size="sm" className="ml-auto" onClick={() => setAdding((v) => !v)}>
            <PlusIcon className="w-4 h-4 mr-1" /> New Secret
          </Button>
        </div>
        {adding && (
          <Card className="p-4 flex flex-col gap-3 max-w-md">
            <Input
              placeholder="Secret Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Secret Value"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="mb-2"
              type="text"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddSecret}>Add</Button>
            </div>
          </Card>
        )}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-4 mb-2">
            <Input
              placeholder="Search..."
              className="w-72 bg-muted/40 border-none focus:ring-0 focus:bg-muted"
              // value={search}
              // onChange={e => setSearch(e.target.value)}
            />
            {/* <Select/Filter/Sort controls can go here if needed */}
          </div>
          <div className="flex flex-col gap-2 w-full">
            {secrets.length === 0 && (
              <Card className="p-6 text-center text-muted-foreground">No secrets stored yet.</Card>
            )}
            {secrets.map(secret => (
              <Card
                key={secret.id}
                className="flex flex-row items-center gap-4 px-4 py-3 bg-background/80 border border-border shadow-sm rounded-xl hover:bg-accent/30 transition-colors w-full"
              >
                {/* Left icon */}
                <KeyIcon className="w-5 h-5 text-muted-foreground mr-2 flex-shrink-0" />
                {/* Name and environment (inline) */}
                <div className="flex flex-col min-w-0 w-64 justify-center">
                  <div className="font-mono font-semibold text-base text-foreground truncate leading-tight">{secret.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight">All Environments</div>
                </div>
                {/* Right-aligned secret and actions */}
                <div className="flex flex-row items-center gap-2 ml-auto">
                  <div className="flex flex-row items-center gap-2 w-72">
                    <Input
                      type={showSecret[secret.id] ? "text" : "password"}
                      value={secret.key}
                      readOnly
                      className="w-full bg-muted/40 border-none font-mono tracking-wider text-base px-3 py-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSecret(s => ({ ...s, [secret.id]: !s[secret.id] }))}
                      aria-label={showSecret[secret.id] ? "Hide secret" : "Show secret"}
                    >
                      {showSecret[secret.id] ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground whitespace-nowrap">Updated Jul 25</div>
                  <div className="ml-2 w-3 h-3 rounded-full bg-green-400" />
                  <Button variant="ghost" size="icon" className="ml-2">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ResizableLayout>
  )
}
