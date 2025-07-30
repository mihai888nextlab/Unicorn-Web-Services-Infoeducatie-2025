"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, CpuChipIcon, TrashIcon, PlayIcon, StopIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ResizableLayout } from "@/components/layout/resizable-layout"

interface ComputeInstance {
  id: string
  name: string
  type: "vm" | "container"
  image: string
  cpu: number
  ram: number
  storage: number
  status: "pending" | "running" | "stopped" | "error"
  createdAt: string
}

const initialInstances: ComputeInstance[] = [
  {
    id: "1",
    name: "Web Server",
    type: "vm",
    image: "ubuntu-22.04",
    cpu: 2,
    ram: 4096,
    storage: 40,
    status: "running",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "API Container",
    type: "container",
    image: "node:20-alpine",
    cpu: 1,
    ram: 1024,
    storage: 10,
    status: "stopped",
    createdAt: new Date().toISOString(),
  },
]

export default function ComputePage() {
  const [instances, setInstances] = useState<ComputeInstance[]>(initialInstances)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"vm" | "container">("vm")
  const [newImage, setNewImage] = useState("")
  const [newCpu, setNewCpu] = useState(1)
  const [newRam, setNewRam] = useState(1024)
  const [newStorage, setNewStorage] = useState(10)

  const handleAdd = () => {
    if (!newName.trim() || !newImage.trim()) return
    setInstances([
      ...instances,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        type: newType,
        image: newImage.trim(),
        cpu: newCpu,
        ram: newRam,
        storage: newStorage,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ])
    setAdding(false)
    setNewName("")
    setNewImage("")
    setNewCpu(1)
    setNewRam(1024)
    setNewStorage(10)
  }

  const handleAction = (id: string, action: "start" | "stop" | "restart" | "delete") => {
    setInstances(instances =>
      instances.map(inst =>
        inst.id === id
          ? action === "delete"
            ? null
            : {
                ...inst,
                status:
                  action === "start"
                    ? "running"
                    : action === "stop"
                    ? "stopped"
                    : action === "restart"
                    ? "running"
                    : inst.status,
              }
          : inst
      ).filter(Boolean) as ComputeInstance[]
    )
  }

  return (
    <AuthGuard>
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Compute Instances</h1>
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <PlusIcon className="w-4 h-4 mr-1" /> New Instance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle>New Compute Instance</DialogTitle>
              <div className="flex flex-col gap-3 mt-2">
                <Input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant={newType === "vm" ? "default" : "outline"} size="sm" onClick={() => setNewType("vm")}>VM</Button>
                  <Button variant={newType === "container" ? "default" : "outline"} size="sm" onClick={() => setNewType("container")}>Container</Button>
                </div>
                <Input placeholder="Image (e.g. ubuntu-22.04, node:20-alpine)" value={newImage} onChange={e => setNewImage(e.target.value)} />
                <div className="flex gap-2">
                  <Input type="number" min={1} max={16} value={newCpu} onChange={e => setNewCpu(Number(e.target.value))} className="w-20" placeholder="CPU" />
                  <Input type="number" min={128} max={65536} value={newRam} onChange={e => setNewRam(Number(e.target.value))} className="w-28" placeholder="RAM (MB)" />
                  <Input type="number" min={1} max={1000} value={newStorage} onChange={e => setNewStorage(Number(e.target.value))} className="w-28" placeholder="Storage (GB)" />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button size="sm" onClick={handleAdd}>Add</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {instances.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">No compute instances yet.</Card>
          )}
          {instances.map(inst => (
            <Card key={inst.id} className="flex flex-row items-center gap-4 px-4 py-3 bg-background/80 border border-border shadow-sm rounded-xl hover:bg-accent/30 transition-colors w-full">
              <CpuChipIcon className="w-5 h-5 text-muted-foreground mr-2 flex-shrink-0" />
              <div className="flex flex-col min-w-0 w-64 justify-center">
                <div className="font-mono font-semibold text-base text-foreground truncate leading-tight">{inst.name}</div>
                <div className="text-xs text-muted-foreground leading-tight">{inst.type === "vm" ? "Virtual Machine" : "Container"}</div>
              </div>
              <div className="flex flex-row items-center gap-2 ml-auto">
                <div className="flex flex-row items-center gap-2 w-96">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{inst.image}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{inst.cpu} CPU</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{inst.ram} MB</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{inst.storage} GB</div>
                  <div className={`ml-2 w-3 h-3 rounded-full ${inst.status === "running" ? "bg-green-400" : inst.status === "pending" ? "bg-yellow-400" : inst.status === "stopped" ? "bg-gray-400" : "bg-red-400"}`} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <CpuChipIcon className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {inst.status !== "running" && (
                      <DropdownMenuItem onClick={() => handleAction(inst.id, "start")}> <PlayIcon className="w-4 h-4 mr-2" /> Start </DropdownMenuItem>
                    )}
                    {inst.status === "running" && (
                      <DropdownMenuItem onClick={() => handleAction(inst.id, "stop")}> <StopIcon className="w-4 h-4 mr-2" /> Stop </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleAction(inst.id, "restart")}> <ArrowPathIcon className="w-4 h-4 mr-2" /> Restart </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction(inst.id, "delete")}> <TrashIcon className="w-4 h-4 mr-2" /> Delete </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ResizableLayout>
    </AuthGuard>
  )
}
