"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, CodeBracketIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon, PlayIcon, DocumentArrowUpIcon, ChartBarIcon, PencilIcon } from "@heroicons/react/24/outline"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ResizableLayout } from "@/components/layout/resizable-layout"
import { useAuth } from "@/hooks/useAuth"

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <ArrowPathIcon className="w-6 h-6 animate-spin" />
    </div>
  ),
})

interface LambdaFunction {
  id: string
  name: string
  displayName: string
  description?: string
  runtime: string
  handler: string
  status: string
  timeout?: number
  memorySize?: number
  lastModified: string
  createdAt: string
  invocationCount?: number
  versionCount?: number
}

interface FunctionVersion {
  id: string
  version: string
  description: string
  createdAt: string
}

interface FunctionInvocation {
  id: string
  requestId: string
  statusCode: number
  duration: number
  startTime: string
}

const RUNTIMES = [
  { value: "nodejs18.x", label: "Node.js 18.x", language: "javascript" },
  { value: "nodejs20.x", label: "Node.js 20.x", language: "javascript" },
  { value: "python3.9", label: "Python 3.9", language: "python" },
  { value: "python3.10", label: "Python 3.10", language: "python" },
  { value: "python3.11", label: "Python 3.11", language: "python" },
]

const CODE_TEMPLATES = {
  javascript: `exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Your business logic here
    const response = {
        message: 'Hello from Lambda!',
        input: event,
        timestamp: new Date().toISOString()
    };
    
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
};`,
  python: `import json
import datetime

def handler(event, context):
    print(f"Event: {json.dumps(event)}")
    
    # Your business logic here
    response = {
        "message": "Hello from Lambda!",
        "input": event,
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    return {
        "statusCode": 200,
        "body": json.dumps(response)
    }
`
}

export default function LambdaPage() {
  const { user } = useAuth()
  const [functions, setFunctions] = useState<LambdaFunction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal state
  const [selectedFunction, setSelectedFunction] = useState<LambdaFunction | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [functionDetails, setFunctionDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  
  // Invoke state
  const [showInvokeModal, setShowInvokeModal] = useState(false)
  const [invokePayload, setInvokePayload] = useState("{}")
  const [invocationType, setInvocationType] = useState("RequestResponse")
  const [invokeLoading, setInvokeLoading] = useState(false)
  const [invokeResult, setInvokeResult] = useState<any>(null)
  
  // Form state
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newRuntime, setNewRuntime] = useState("nodejs20.x")
  const [newHandler, setNewHandler] = useState("index.handler")
  const [newTimeout, setNewTimeout] = useState(3)
  const [newMemorySize, setNewMemorySize] = useState(128)
  const [newEnvVars, setNewEnvVars] = useState("{}")
  const [newZipFile, setNewZipFile] = useState<File | null>(null)
  
  // Code editor state
  const [useCodeEditor, setUseCodeEditor] = useState(false)
  const [editorCode, setEditorCode] = useState(CODE_TEMPLATES.javascript)
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  // Fetch functions
  const fetchFunctions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFunctions(Array.isArray(data) ? data : [])
      } else if (response.status === 404) {
        setFunctions([])
      } else {
        throw new Error(`Failed to fetch functions: ${response.status}`)
      }
    } catch (err) {
      console.error("Error fetching functions:", err)
      setFunctions([])
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Handle runtime change
  const handleRuntimeChange = (runtime: string) => {
    setNewRuntime(runtime)
    const language = RUNTIMES.find(r => r.value === runtime)?.language || "javascript"
    setEditorCode(CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES])
    
    // Update handler based on language
    if (language === "python") {
      setNewHandler("lambda_function.handler")
    } else {
      setNewHandler("index.handler")
    }
  }

  // Create ZIP from code editor
  const createZipFromCode = async (code: string, runtime: string): Promise<Blob> => {
    const language = RUNTIMES.find(r => r.value === runtime)?.language || "javascript"
    const filename = language === "python" ? "lambda_function.py" : "index.js"
    
    // Create a blob from the code
    const codeBlob = new Blob([code], { type: "text/plain" })
    
    // For now, we'll send the code as a file
    // In a real implementation, you'd create an actual ZIP file
    return codeBlob
  }

  // Create new function
  const createFunction = async () => {
    if (!newName.trim()) {
      setCreateError("Name is required")
      return
    }
    
    if (!useCodeEditor && !newZipFile) {
      setCreateError("Either write code or upload a ZIP file")
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setCreateError("No authentication token found")
        return
      }

      const formData = new FormData()
      formData.append("name", newName.trim())
      if (newDescription.trim()) {
        formData.append("description", newDescription.trim())
      }
      formData.append("runtime", newRuntime)
      formData.append("handler", newHandler)
      formData.append("timeout", newTimeout.toString())
      formData.append("memorySize", newMemorySize.toString())
      if (newEnvVars.trim() && newEnvVars !== "{}") {
        formData.append("envVars", newEnvVars)
      }
      
      // Handle file upload
      if (useCodeEditor) {
        // Create a file from the editor code
        const language = RUNTIMES.find(r => r.value === newRuntime)?.language || "javascript"
        const filename = language === "python" ? "lambda_function.py" : "index.js"
        const file = new File([editorCode], filename, { type: "text/plain" })
        const zipFile = new File([file], "function.zip", { type: "application/zip" })
        formData.append("zipFile", zipFile)
      } else {
        formData.append("zipFile", newZipFile!)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || `Failed to create function: ${response.status}`)
      }

      // Reset form and close modal
      setNewName("")
      setNewDescription("")
      setNewRuntime("nodejs20.x")
      setNewHandler("index.handler")
      setNewTimeout(3)
      setNewMemorySize(128)
      setNewEnvVars("{}")
      setNewZipFile(null)
      setUseCodeEditor(false)
      setEditorCode(CODE_TEMPLATES.javascript)
      setAdding(false)

      // Refresh functions
      await fetchFunctions()
    } catch (err) {
      console.error("Error creating function:", err)
      setCreateError(err instanceof Error ? err.message : "Failed to create function")
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete function
  const deleteFunction = async (functionName: string) => {
    try {
      setActionLoading(`${functionName}-delete`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions/${functionName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to delete function")
      }

      await fetchFunctions(false)
    } catch (err) {
      console.error("Error deleting function:", err)
      setError(err instanceof Error ? err.message : "Failed to delete function")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Fetch function details
  const fetchFunctionDetails = async (functionName: string) => {
    try {
      setDetailsLoading(true)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions/${functionName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFunctionDetails(data)
      }
    } catch (err) {
      console.error("Error fetching function details:", err)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Invoke function
  const invokeFunction = async () => {
    if (!selectedFunction) return

    try {
      setInvokeLoading(true)
      setInvokeResult(null)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      let payload = {}
      try {
        payload = JSON.parse(invokePayload)
      } catch (e) {
        setInvokeResult({ error: "Invalid JSON payload" })
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lambda/functions/${selectedFunction.name}/invoke`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload,
            invocationType,
          }),
        }
      )

      const data = await response.json()
      setInvokeResult(data)
    } catch (err) {
      console.error("Error invoking function:", err)
      setInvokeResult({ error: err instanceof Error ? err.message : "Failed to invoke function" })
    } finally {
      setInvokeLoading(false)
    }
  }

  // Open function details
  const openFunctionDetails = (func: LambdaFunction) => {
    setSelectedFunction(func)
    setShowDetailsModal(true)
    setFunctionDetails(null)
    fetchFunctionDetails(func.name)
  }

  // Open invoke modal
  const openInvokeModal = (func: LambdaFunction) => {
    setSelectedFunction(func)
    setShowInvokeModal(true)
    setInvokePayload("{}")
    setInvokeResult(null)
  }

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchFunctions()
      
      // Set up polling
      const interval = setInterval(() => {
        fetchFunctions(false)
      }, 10000) // Poll every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-400"
      case "creating":
      case "updating":
        return "bg-yellow-400 animate-pulse"
      case "failed":
      case "error":
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Lambda Functions</h1>
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <PlusIcon className="w-4 h-4 mr-1" /> New Function
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogTitle>Create New Lambda Function</DialogTitle>
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <Label htmlFor="name">Function Name*</Label>
                  <Input 
                    id="name"
                    placeholder="my-function" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value.toLowerCase())} 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Function description" 
                    value={newDescription} 
                    onChange={e => setNewDescription(e.target.value)} 
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="runtime">Runtime*</Label>
                  <Select value={newRuntime} onValueChange={handleRuntimeChange}>
                    <SelectTrigger id="runtime" className="mt-1">
                      <SelectValue placeholder="Select runtime" />
                    </SelectTrigger>
                    <SelectContent>
                      {RUNTIMES.map(runtime => (
                        <SelectItem key={runtime.value} value={runtime.value}>
                          {runtime.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="handler">Handler*</Label>
                  <Input 
                    id="handler"
                    placeholder="index.handler" 
                    value={newHandler} 
                    onChange={e => setNewHandler(e.target.value)} 
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input 
                      id="timeout"
                      type="number"
                      min={1}
                      max={900}
                      value={newTimeout} 
                      onChange={e => setNewTimeout(Number(e.target.value))} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory">Memory (MB)</Label>
                    <Select value={newMemorySize.toString()} onValueChange={v => setNewMemorySize(Number(v))}>
                      <SelectTrigger id="memory" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[128, 256, 512, 1024, 2048, 3072].map(size => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} MB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="envVars">Environment Variables (JSON)</Label>
                  <Textarea 
                    id="envVars"
                    placeholder='{"KEY": "value"}' 
                    value={newEnvVars} 
                    onChange={e => setNewEnvVars(e.target.value)} 
                    className="mt-1 font-mono"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Function Code*</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={!useCodeEditor ? "default" : "outline"}
                        onClick={() => setUseCodeEditor(false)}
                      >
                        <DocumentArrowUpIcon className="w-4 h-4 mr-1" /> Upload ZIP
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={useCodeEditor ? "default" : "outline"}
                        onClick={() => setUseCodeEditor(true)}
                      >
                        <PencilIcon className="w-4 h-4 mr-1" /> Write Code
                      </Button>
                    </div>
                    
                    {!useCodeEditor ? (
                      <div>
                        <Input 
                          id="zipFile"
                          type="file"
                          accept=".zip"
                          onChange={e => setNewZipFile(e.target.files?.[0] || null)} 
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a ZIP file containing your function code
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCodeEditor(true)}
                          className="w-full"
                        >
                          <CodeBracketIcon className="w-4 h-4 mr-1" /> Open Code Editor
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Write your function code directly in the editor
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {createError && (
                  <div className="text-sm text-red-500 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {createError}
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-2">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAdding(false)
                      setCreateError(null)
                    }}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    size="sm" 
                    onClick={createFunction}
                    disabled={createLoading || !newName || (!useCodeEditor && !newZipFile)}
                  >
                    {createLoading ? "Creating..." : "Create Function"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {loading && (
            <Card className="p-6 text-center text-muted-foreground">
              <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading functions...
            </Card>
          )}
          
          {!loading && functions.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">
              No Lambda functions deployed yet. Click "New Function" to create your first function.
            </Card>
          )}
          
          {!loading && functions.map(func => (
            <Card 
              key={func.id} 
              className="flex flex-col gap-3 p-4 bg-background/80 border border-border shadow-sm rounded-xl hover:bg-accent/30 transition-colors w-full cursor-pointer"
              onClick={() => openFunctionDetails(func)}
            >
              <div className="flex items-center gap-4">
                <CodeBracketIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-semibold text-base text-foreground truncate">{func.name}</div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(func.status)}`} />
                    <span className="text-xs text-muted-foreground capitalize">{func.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{func.runtime} " {func.handler}</div>
                  {func.description && (
                    <div className="text-xs text-muted-foreground mt-1">{func.description}</div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={actionLoading !== null}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionLoading?.startsWith(func.name) ? (
                        <ArrowPathIcon className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <CodeBracketIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        openInvokeModal(func)
                      }}
                      disabled={actionLoading !== null || func.status !== "ACTIVE"}
                    >
                      <PlayIcon className="w-4 h-4 mr-2" /> Invoke
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        openFunctionDetails(func)
                      }}
                      disabled={actionLoading !== null}
                    >
                      <ChartBarIcon className="w-4 h-4 mr-2" /> Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFunction(func.name)
                      }} 
                      className="text-red-600"
                      disabled={actionLoading !== null}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {func.timeout && <div>Timeout: {func.timeout}s</div>}
                {func.memorySize && <div>Memory: {func.memorySize}MB</div>}
                {func.invocationCount !== undefined && <div>{func.invocationCount} invocations</div>}
                <div>Last modified: {new Date(func.lastModified).toLocaleString()}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Function Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              {selectedFunction?.displayName || selectedFunction?.name || "Function Details"}
            </DialogTitle>
            {selectedFunction && (
              <div className="flex flex-col gap-6 mt-4">
                {detailsLoading ? (
                  <div className="text-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading details...
                  </div>
                ) : functionDetails ? (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Function Name</Label>
                          <p className="font-mono">{functionDetails.name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(functionDetails.status)}`} />
                            <span className="capitalize">{functionDetails.status}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Runtime</Label>
                          <p>{functionDetails.runtime}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Handler</Label>
                          <p className="font-mono">{functionDetails.handler}</p>
                        </div>
                      </div>
                      {functionDetails.description && (
                        <div>
                          <Label className="text-muted-foreground">Description</Label>
                          <p>{functionDetails.description}</p>
                        </div>
                      )}
                    </div>

                    {functionDetails.versions && functionDetails.versions.length > 0 && (
                      <div>
                        <Label>Function Versions</Label>
                        <div className="mt-2 space-y-2">
                          {functionDetails.versions.map((version: FunctionVersion) => (
                            <div key={version.id} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-mono">v{version.version}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(version.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {version.description && (
                                <p className="text-sm text-muted-foreground mt-1">{version.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {functionDetails.invocations && functionDetails.invocations.length > 0 && (
                      <div>
                        <Label>Recent Invocations</Label>
                        <div className="mt-2 space-y-2">
                          {functionDetails.invocations.slice(0, 5).map((invocation: FunctionInvocation) => (
                            <div key={invocation.id} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    invocation.statusCode === 200 
                                      ? 'bg-green-500/20 text-green-500' 
                                      : 'bg-red-500/20 text-red-500'
                                  }`}>
                                    {invocation.statusCode}
                                  </span>
                                  <span className="text-sm">{invocation.duration}ms</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(invocation.startTime).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {invocation.requestId}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setShowDetailsModal(false)
                          openInvokeModal(selectedFunction)
                        }}
                        disabled={selectedFunction.status !== "ACTIVE"}
                      >
                        <PlayIcon className="w-4 h-4 mr-1" /> Invoke Function
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteFunction(selectedFunction.name)
                          setShowDetailsModal(false)
                        }}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>Basic function information displayed above.</div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Invoke Function Modal */}
        <Dialog open={showInvokeModal} onOpenChange={setShowInvokeModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              Invoke {selectedFunction?.name}
            </DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <Label htmlFor="invocationType">Invocation Type</Label>
                <Select value={invocationType} onValueChange={setInvocationType}>
                  <SelectTrigger id="invocationType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RequestResponse">Request/Response (Synchronous)</SelectItem>
                    <SelectItem value="Event">Event (Asynchronous)</SelectItem>
                    <SelectItem value="DryRun">Dry Run (Validate only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payload">Payload (JSON)</Label>
                <Textarea 
                  id="payload"
                  placeholder='{"key": "value"}' 
                  value={invokePayload} 
                  onChange={e => setInvokePayload(e.target.value)} 
                  className="mt-1 font-mono"
                  rows={8}
                />
              </div>

              {invokeResult && (
                <div>
                  <Label>Result</Label>
                  <div className="mt-1 p-4 bg-black text-white rounded-lg font-mono text-sm overflow-x-auto">
                    {invokeResult.error ? (
                      <div className="text-red-400">Error: {invokeResult.error}</div>
                    ) : (
                      <>
                        <div className="text-green-400 mb-2">
                          Status: {invokeResult.statusCode}
                        </div>
                        {invokeResult.executionInfo && (
                          <div className="text-gray-400 text-xs mb-2">
                            Duration: {invokeResult.executionInfo.duration}ms | 
                            Memory: {invokeResult.executionInfo.memoryUsed}MB | 
                            Request ID: {invokeResult.executionInfo.requestId}
                          </div>
                        )}
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(invokeResult.response, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DialogClose>
                <Button 
                  size="sm" 
                  onClick={invokeFunction}
                  disabled={invokeLoading}
                >
                  {invokeLoading ? "Invoking..." : "Invoke"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Code Editor Modal */}
        <Dialog open={showCodeEditor} onOpenChange={setShowCodeEditor}>
          <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
            <DialogTitle>
              Function Code Editor
            </DialogTitle>
            <div className="flex flex-col gap-4 mt-4 h-[70vh]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Runtime: {RUNTIMES.find(r => r.value === newRuntime)?.label} | Handler: {newHandler}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const language = RUNTIMES.find(r => r.value === newRuntime)?.language || "javascript"
                      setEditorCode(CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES])
                    }}
                  >
                    Reset Template
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 border rounded-lg overflow-hidden">
                <MonacoEditor
                  value={editorCode}
                  onChange={(value) => setEditorCode(value || "")}
                  language={RUNTIMES.find(r => r.value === newRuntime)?.language || "javascript"}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm">
                    Save Code
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResizableLayout>
  )
}