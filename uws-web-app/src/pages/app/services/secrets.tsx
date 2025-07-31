"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  KeyIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  ShareIcon,
  ClockIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { ResizableLayout } from "@/components/layout/resizable-layout"

interface SecretData {
  [key: string]: any
}

interface SecretMetadata {
  tags?: string[]
  description?: string
  expirationDate?: string
  sharedWith?: string[]
}

interface Secret {
  path: string
  data?: SecretData
  metadata?: SecretMetadata
  createdAt?: string
  updatedAt?: string
  shared?: boolean
}

interface SecretVersion {
  version: number
  data: SecretData
  metadata?: SecretMetadata
  createdAt: string
  createdBy: string
}

export default function SecretsManagerPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState("/")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null)
  const [showSecretValues, setShowSecretValues] = useState<{ [path: string]: boolean }>({})
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Form states
  const [secretPath, setSecretPath] = useState("")
  const [secretData, setSecretData] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" }
  ])
  const [secretDescription, setSecretDescription] = useState("")
  const [secretTags, setSecretTags] = useState("")
  const [secretExpiration, setSecretExpiration] = useState("")
  const [shareUserId, setShareUserId] = useState("")
  const [versions, setVersions] = useState<SecretVersion[]>([])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const fetchSecrets = async (path: string = "/") => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets?path=${encodeURIComponent(path)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch secrets")
      }

      const data = await response.json()
      setSecrets(data.secrets || [])
    } catch (error) {
      console.error("Error fetching secrets:", error)
    } finally {
      setLoading(false)
    }
  }

  const createSecret = async () => {
    try {
      const dataObj: SecretData = {}
      secretData.forEach(item => {
        if (item.key && item.value) {
          dataObj[item.key] = item.value
        }
      })

      const metadata: SecretMetadata = {}
      if (secretDescription) metadata.description = secretDescription
      if (secretTags) metadata.tags = secretTags.split(",").map(t => t.trim())
      if (secretExpiration) metadata.expirationDate = new Date(secretExpiration).toISOString()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/${secretPath}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ data: dataObj, metadata }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create secret")
      }

      setIsCreateModalOpen(false)
      resetForm()
      fetchSecrets(currentPath)
    } catch (error) {
      console.error("Error creating secret:", error)
    }
  }

  const updateSecret = async () => {
    if (!selectedSecret) return

    try {
      const dataObj: SecretData = {}
      secretData.forEach(item => {
        if (item.key && item.value) {
          dataObj[item.key] = item.value
        }
      })

      const metadata: SecretMetadata = {}
      if (secretDescription) metadata.description = secretDescription
      if (secretTags) metadata.tags = secretTags.split(",").map(t => t.trim())
      if (secretExpiration) metadata.expirationDate = new Date(secretExpiration).toISOString()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/${selectedSecret.path}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ data: dataObj, metadata }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update secret")
      }

      setIsEditModalOpen(false)
      resetForm()
      fetchSecrets(currentPath)
    } catch (error) {
      console.error("Error updating secret:", error)
    }
  }

  const deleteSecret = async () => {
    if (!selectedSecret) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/${selectedSecret.path}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete secret")
      }

      setIsDeleteModalOpen(false)
      setSelectedSecret(null)
      fetchSecrets(currentPath)
    } catch (error) {
      console.error("Error deleting secret:", error)
    }
  }

  const getSecret = async (path: string, shared: boolean = false) => {
    try {
      const url = shared 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/${path}?shared=true`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/${path}`
        
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch secret")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching secret:", error)
      return null
    }
  }

  const shareSecret = async () => {
    if (!selectedSecret || !shareUserId) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/share/${selectedSecret.path}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId: shareUserId }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to share secret")
      }

      setIsShareModalOpen(false)
      setShareUserId("")
    } catch (error) {
      console.error("Error sharing secret:", error)
    }
  }

  const unshareSecret = async (userId: string) => {
    if (!selectedSecret) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/share/${selectedSecret.path}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to unshare secret")
      }

      console.log("Secret unshared successfully")
    } catch (error) {
      console.error("Error unsharing secret:", error)
    }
  }

  const fetchVersions = async (path: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/secrets/versions/${path}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch versions")
      }

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      console.error("Error fetching versions:", error)
    }
  }

  const resetForm = () => {
    setSecretPath("")
    setSecretData([{ key: "", value: "" }])
    setSecretDescription("")
    setSecretTags("")
    setSecretExpiration("")
    setSelectedSecret(null)
  }

  const addDataField = () => {
    setSecretData([...secretData, { key: "", value: "" }])
  }

  const removeDataField = (index: number) => {
    setSecretData(secretData.filter((_, i) => i !== index))
  }

  const updateDataField = (index: number, field: "key" | "value", value: string) => {
    const newData = [...secretData]
    newData[index][field] = value
    setSecretData(newData)
  }

  const openEditModal = async (secret: Secret) => {
    const fullSecret = await getSecret(secret.path)
    if (fullSecret) {
      setSelectedSecret(fullSecret)
      setSecretPath(fullSecret.path)
      
      // Convert data object to array format
      const dataArray = Object.entries(fullSecret.data || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      setSecretData(dataArray.length > 0 ? dataArray : [{ key: "", value: "" }])
      
      setSecretDescription(fullSecret.metadata?.description || "")
      setSecretTags(fullSecret.metadata?.tags?.join(", ") || "")
      setSecretExpiration(fullSecret.metadata?.expirationDate ? 
        new Date(fullSecret.metadata.expirationDate).toISOString().split('T')[0] : ""
      )
      
      setIsEditModalOpen(true)
    }
  }

  const openVersionsModal = async (secret: Secret) => {
    setSelectedSecret(secret)
    await fetchVersions(secret.path)
    setIsVersionsModalOpen(true)
  }

  const navigatePath = (path: string) => {
    setCurrentPath(path)
    fetchSecrets(path)
  }

  const filteredSecrets = secrets.filter(secret => 
    secret.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    secret.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    secret.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  useEffect(() => {
    fetchSecrets()
  }, [])

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Secrets Manager</h1>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <button 
                onClick={() => navigatePath("/")}
                className="hover:text-foreground transition-colors"
              >
                Root
              </button>
              {currentPath !== "/" && currentPath.split("/").filter(Boolean).map((part, index, arr) => {
                const path = "/" + arr.slice(0, index + 1).join("/")
                return (
                  <div key={path} className="flex items-center gap-1">
                    <ChevronRightIcon className="w-3 h-3" />
                    <button
                      onClick={() => navigatePath(path)}
                      className="hover:text-foreground transition-colors"
                    >
                      {part}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-1" /> New Secret
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <Card className="p-6 text-center text-muted-foreground">
              Loading secrets...
            </Card>
          ) : filteredSecrets.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              {searchQuery ? "No secrets match your search." : "No secrets found. Create your first secret."}
            </Card>
          ) : (
            filteredSecrets.map((secret) => (
              <Card
                key={secret.path}
                className="flex flex-row items-center gap-4 px-4 py-3 bg-background/80 border border-border shadow-sm rounded-xl hover:bg-accent/30 transition-colors w-full"
              >
                {/* Left icon */}
                <KeyIcon className="w-5 h-5 text-muted-foreground mr-2 flex-shrink-0" />
                
                {/* Name and metadata (inline) */}
                <div className="flex flex-col min-w-0 w-64 justify-center">
                  <div className="font-mono font-semibold text-base text-foreground truncate leading-tight">{secret.path}</div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {secret.metadata?.tags?.join(", ") || "No tags"}
                  </div>
                </div>
                
                {/* Right-aligned secret value and actions */}
                <div className="flex flex-row items-center gap-2 ml-auto">
                  <div className="flex flex-row items-center gap-2 w-72">
                    <Input
                      type="text"
                      value={(() => {
                        if (showSecretValues[secret.path] && secret.data) {
                          const firstValue = Object.values(secret.data)[0]
                          return firstValue ? String(firstValue) : "********"
                        }
                        // Show asterisks based on actual length if we have the data
                        if (secret.data) {
                          const firstValue = Object.values(secret.data)[0]
                          return firstValue ? "*".repeat(String(firstValue).length) : "********"
                        }
                        return "********"
                      })()}
                      readOnly
                      className="w-full bg-muted/40 border-none font-mono tracking-wider text-base px-3 py-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (!showSecretValues[secret.path] && !secret.data) {
                          const fullSecret = await getSecret(secret.path)
                          if (fullSecret) {
                            setSecrets(secrets.map(s => 
                              s.path === secret.path ? { ...s, data: fullSecret.data } : s
                            ))
                          }
                        }
                        setShowSecretValues(prev => ({ 
                          ...prev, 
                          [secret.path]: !prev[secret.path] 
                        }))
                      }}
                      aria-label={showSecretValues[secret.path] ? "Hide secret" : "Show secret"}
                    >
                      {showSecretValues[secret.path] ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <EllipsisHorizontalIcon className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(secret)}>
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View/Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedSecret(secret)
                        setIsShareModalOpen(true)
                      }}>
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openVersionsModal(secret)}>
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Version History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedSecret(secret)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-destructive"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Secret Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? "Edit Secret" : "Create New Secret"}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? "Update the secret data and metadata." : "Enter the secret path and data."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="path">Secret Path</Label>
              <Input
                id="path"
                value={secretPath}
                onChange={(e) => setSecretPath(e.target.value)}
                placeholder="myapp/database/credentials"
                disabled={isEditModalOpen}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Secret Data</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addDataField}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {secretData.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={field.key}
                      onChange={(e) => updateDataField(index, "key", e.target.value)}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => updateDataField(index, "value", e.target.value)}
                      placeholder="Value"
                      type="password"
                      className="flex-1"
                    />
                    {secretData.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDataField(index)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={secretDescription}
                onChange={(e) => setSecretDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={secretTags}
                onChange={(e) => setSecretTags(e.target.value)}
                placeholder="production, database (comma separated)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input
                id="expiration"
                type="date"
                value={secretExpiration}
                onChange={(e) => setSecretExpiration(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateModalOpen(false)
                setIsEditModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditModalOpen ? updateSecret : createSecret}>
              {isEditModalOpen ? "Update" : "Create"} Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Secret Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Secret</DialogTitle>
            <DialogDescription>
              Share "{selectedSecret?.path}" with another user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={shareUserId}
                onChange={(e) => setShareUserId(e.target.value)}
                placeholder="Enter user ID to share with"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={shareSecret}>Share Secret</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Modal */}
      <Dialog open={isVersionsModalOpen} onOpenChange={setIsVersionsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View all versions of "{selectedSecret?.path}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto max-h-[50vh]">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No version history available.
              </p>
            ) : (
              versions.map((version) => (
                <Card key={version.version} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Version {version.version}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Created by:</span> {version.createdBy}
                    </p>
                    {version.metadata?.description && (
                      <p className="text-sm">
                        <span className="font-medium">Description:</span> {version.metadata.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Secret</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSecret?.path}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteSecret}>
              Delete Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResizableLayout>
  )
}