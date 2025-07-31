"use client"

import { useState, useEffect } from "react"
import { ResizableLayout } from "@/components/layout/resizable-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  QueueListIcon,
  PlusIcon, 
  PaperAirplaneIcon,
  InboxIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  ServerIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { useAuth } from "@/hooks/useAuth"

// Types for Queue Service
interface Queue {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  tier: string;
  fifo: boolean;
  queueUrl: string;
  status: string;
  approximateNumberOfMessages?: number;
  approximateNumberOfMessagesInFlight?: number;
  approximateNumberOfMessagesDelayed?: number;
  createdAt: string;
  config?: {
    maxMessages: number;
    maxMessageSize: number;
    retentionPeriod: number;
    visibilityTimeout: number;
    price: number;
  };
}

interface Message {
  messageId: string;
  receiptHandle: string;
  body: string;
  messageAttributes?: { [key: string]: any };
  md5OfBody: string;
  attributes?: {
    approximateReceiveCount: string;
    approximateFirstReceiveTimestamp: string;
  };
}

interface QueueConfigs {
  basic: any;
  standard: any;
  premium: any;
}

interface QueueMetrics {
  queueName: string;
  period: string;
  messageStats: {
    available: number;
    in_flight: number;
    delayed: number;
  };
  timeSeries: Array<{
    timestamp: string;
    messagesSent: number;
    messagesReceived: number;
    messagesDeleted: number;
  }>;
}

export default function QueuePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("queues")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Queue management state
  const [queues, setQueues] = useState<Queue[]>([])
  const [, setQueueConfigs] = useState<QueueConfigs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Queue creation state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newQueue, setNewQueue] = useState({
    name: "",
    description: "",
    tier: "basic",
    fifo: false
  })
  
  // Selected queue and messages
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null)
  const [queueDetails, setQueueDetails] = useState<any | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [metricsLoading, setMetricsLoading] = useState(false)
  
  // Message management state
  const [showSendModal, setShowSendModal] = useState(false)
  const [showBatchSendModal, setShowBatchSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  
  const [messageForm, setMessageForm] = useState({
    messageBody: "",
    delaySeconds: 0,
    attributes: "{}"
  })
  
  const [batchMessages, setBatchMessages] = useState([
    { id: "msg1", messageBody: "" },
    { id: "msg2", messageBody: "" }
  ])
  
  const [receiveForm, setReceiveForm] = useState({
    maxNumberOfMessages: 5,
    waitTimeSeconds: 10,
    visibilityTimeout: 30
  })

  // Fetch queue configurations
  const fetchQueueConfigs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/configs`, {
        method: 'GET'
      })
      
      if (!response.ok) {
        console.warn(`Queue configs endpoint not available: ${response.status}`)
        // Set default configs if endpoint is not available
        setQueueConfigs({
          basic: { tier: 'basic', name: 'Basic', description: 'Basic tier', maxMessages: 1000, maxMessageSize: 256, retentionPeriod: 7, visibilityTimeout: 30, price: 5 },
          standard: { tier: 'standard', name: 'Standard', description: 'Standard tier', maxMessages: 10000, maxMessageSize: 1024, retentionPeriod: 14, visibilityTimeout: 60, price: 15 },
          premium: { tier: 'premium', name: 'Premium', description: 'Premium tier', maxMessages: 100000, maxMessageSize: 2048, retentionPeriod: 30, visibilityTimeout: 120, price: 50 }
        })
        return
      }
      
      const configs = await response.json()
      setQueueConfigs(configs)
    } catch (err) {
      console.error("Error fetching queue configs:", err)
      // Set default configs on network error
      setQueueConfigs({
        basic: { tier: 'basic', name: 'Basic', description: 'Basic tier', maxMessages: 1000, maxMessageSize: 256, retentionPeriod: 7, visibilityTimeout: 30, price: 5 },
        standard: { tier: 'standard', name: 'Standard', description: 'Standard tier', maxMessages: 10000, maxMessageSize: 1024, retentionPeriod: 14, visibilityTimeout: 60, price: 15 },
        premium: { tier: 'premium', name: 'Premium', description: 'Premium tier', maxMessages: 100000, maxMessageSize: 2048, retentionPeriod: 30, visibilityTimeout: 120, price: 50 }
      })
    }
  }

  // Fetch queues
  const fetchQueues = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setQueues([])
          return
        }
        throw new Error(`Failed to fetch queues: ${response.status}`)
      }

      const data = await response.json()
      setQueues(data)
    } catch (err) {
      console.error("Error fetching queues:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch queues")
      setQueues([])
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Create queue
  const createQueue = async () => {
    if (!newQueue.name.trim()) {
      setCreateError("Queue name is required")
      return
    }

    const nameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-_]*[a-zA-Z0-9])?$/
    if (!nameRegex.test(newQueue.name.trim())) {
      setCreateError("Queue name must start and end with alphanumeric characters")
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newQueue.name.trim(),
          description: newQueue.description.trim(),
          tier: newQueue.tier,
          fifo: newQueue.fifo
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || `Failed to create queue: ${response.status}`)
      }

      // Reset form and close modal
      setNewQueue({ name: "", description: "", tier: "basic", fifo: false })
      setShowCreateModal(false)

      // Refresh queues
      await fetchQueues()
    } catch (err) {
      console.error("Error creating queue:", err)
      setCreateError(err instanceof Error ? err.message : "Failed to create queue")
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete queue
  const deleteQueue = async (queueName: string) => {
    if (!confirm(`Are you sure you want to delete queue "${queueName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(`${queueName}-delete`)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(queueName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || 'Failed to delete queue')
      }

      await fetchQueues(false)
      
      if (selectedQueue?.name === queueName) {
        setSelectedQueue(null)
        setQueueDetails(null)
        setMessages([])
        setQueueMetrics(null)
      }
    } catch (err) {
      console.error("Error deleting queue:", err)
      setError(err instanceof Error ? err.message : "Failed to delete queue")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Purge queue
  const purgeQueue = async (queueName: string) => {
    if (!confirm(`Are you sure you want to purge all messages from queue "${queueName}"?`)) {
      return
    }

    try {
      setActionLoading(`${queueName}-purge`)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(queueName)}/purge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || 'Failed to purge queue')
      }
      
      if (selectedQueue?.name === queueName) {
        setMessages([])
        await fetchQueueMetrics(queueName)
      }
    } catch (err) {
      console.error("Error purging queue:", err)
      setError(err instanceof Error ? err.message : "Failed to purge queue")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Select queue and fetch details
  const selectQueue = async (queue: Queue) => {
    setSelectedQueue(queue)
    setMessages([])
    setQueueMetrics(null)
    
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(queue.name)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const details = await response.json()
        setQueueDetails(details)
      }
      
      await fetchQueueMetrics(queue.name)
    } catch (err) {
      console.error("Error fetching queue details:", err)
    }
  }

  // Fetch queue metrics
  const fetchQueueMetrics = async (queueName: string) => {
    try {
      setMetricsLoading(true)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(queueName)}/metrics?hours=24`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const metrics = await response.json()
        setQueueMetrics(metrics)
      }
    } catch (err) {
      console.error("Error fetching queue metrics:", err)
    } finally {
      setMetricsLoading(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!selectedQueue || !messageForm.messageBody.trim()) {
      setSendError("Message body is required")
      return
    }

    try {
      setSendLoading(true)
      setSendError(null)

      let attributes = {}
      try {
        if (messageForm.attributes.trim()) {
          attributes = JSON.parse(messageForm.attributes)
        }
      } catch (e) {
        setSendError("Invalid JSON in message attributes")
        return
      }

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(selectedQueue.name)}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageBody: messageForm.messageBody,
          delaySeconds: messageForm.delaySeconds,
          messageAttributes: Object.keys(attributes).length > 0 ? attributes : undefined
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || 'Failed to send message')
      }

      // Reset form and close modal
      setMessageForm({ messageBody: "", delaySeconds: 0, attributes: "{}" })
      setShowSendModal(false)

      // Refresh metrics
      await fetchQueueMetrics(selectedQueue.name)
    } catch (err) {
      console.error("Error sending message:", err)
      setSendError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSendLoading(false)
    }
  }

  // Batch send messages
  const batchSendMessages = async () => {
    if (!selectedQueue) return

    const entries = batchMessages.filter(msg => msg.messageBody.trim())
    if (entries.length === 0) {
      setSendError("At least one message body is required")
      return
    }

    try {
      setSendLoading(true)
      setSendError(null)

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(selectedQueue.name)}/messages/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || 'Failed to batch send messages')
      }

      // Reset form and close modal
      setBatchMessages([
        { id: "msg1", messageBody: "" },
        { id: "msg2", messageBody: "" }
      ])
      setShowBatchSendModal(false)

      // Refresh metrics
      await fetchQueueMetrics(selectedQueue.name)
    } catch (err) {
      console.error("Error batch sending messages:", err)
      setSendError(err instanceof Error ? err.message : "Failed to batch send messages")
    } finally {
      setSendLoading(false)
    }
  }

  // Receive messages
  const receiveMessages = async () => {
    if (!selectedQueue) return

    try {
      setReceiveLoading(true)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(selectedQueue.name)}/receive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxNumberOfMessages: receiveForm.maxNumberOfMessages,
          waitTimeSeconds: receiveForm.waitTimeSeconds
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || 'Failed to receive messages')
      }

      const receivedMessages = responseData.messages || []
      setMessages(receivedMessages)
      setShowReceiveModal(false)
      
      // Refresh metrics
      await fetchQueueMetrics(selectedQueue.name)
    } catch (err) {
      console.error("Error receiving messages:", err)
      setError(err instanceof Error ? err.message : "Failed to receive messages")
      setTimeout(() => setError(null), 5000)
    } finally {
      setReceiveLoading(false)
    }
  }

  // Delete message
  const deleteMessage = async (message: Message) => {
    if (!selectedQueue) return

    try {
      setActionLoading(`${message.messageId}-delete`)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(selectedQueue.name)}/messages`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiptHandle: message.receiptHandle })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || 'Failed to delete message')
      }
      
      // Remove message from local state
      setMessages(messages.filter(m => m.messageId !== message.messageId))
      
      // Refresh metrics
      await fetchQueueMetrics(selectedQueue.name)
    } catch (err) {
      console.error("Error deleting message:", err)
      setError(err instanceof Error ? err.message : "Failed to delete message")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Change message visibility
  const changeMessageVisibility = async (message: Message, timeout: number) => {
    if (!selectedQueue) return

    try {
      setActionLoading(`${message.messageId}-visibility`)
      
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/queue/queues/${encodeURIComponent(selectedQueue.name)}/messages/visibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          receiptHandle: message.receiptHandle, 
          visibilityTimeout: timeout 
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || 'Failed to change message visibility')
      }
      
      // You might want to update the message locally or refresh
      setError(`Message visibility changed to ${timeout} seconds`)
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error("Error changing message visibility:", err)
      setError(err instanceof Error ? err.message : "Failed to change message visibility")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter queues
  const filteredQueues = queues.filter(queue =>
    queue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    queue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchQueueConfigs()
      fetchQueues()
      
      // Set up polling
      const interval = setInterval(() => {
        fetchQueues(false)
        if (selectedQueue) {
          fetchQueueMetrics(selectedQueue.name)
        }
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [user, selectedQueue])

  const getStatusColor = (messagesVisible: number = 0) => {
    if (messagesVisible > 100) return "bg-red-400"
    if (messagesVisible > 50) return "bg-yellow-400"
    if (messagesVisible > 0) return "bg-blue-400"
    return "bg-green-400"
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      basic: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      standard: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      premium: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    }
    return (
      <Badge className={colors[tier as keyof typeof colors] || colors.basic}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simple Queue Service</h1>
            <p className="text-muted-foreground text-sm mt-1">Reliable message queuing service</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search queues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="queues" className="flex items-center gap-2">
              <QueueListIcon className="w-4 h-4" />
              Queues
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <InboxIcon className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Queues Tab */}
          <TabsContent value="queues" className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* Queue List */}
            <div className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Message Queues</h2>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="w-4 h-4 mr-1" /> New Queue
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 overflow-y-auto">
                {loading && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-1" />
                    Loading queues...
                  </Card>
                )}
                
                {!loading && filteredQueues.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    No queues yet
                  </Card>
                )}
                
                {!loading && filteredQueues.map(queue => (
                  <Card 
                    key={queue.name} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedQueue?.name === queue.name ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => selectQueue(queue)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <QueueListIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-sm font-medium">{queue.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {queue.description || "No description"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(queue.approximateNumberOfMessages)}`} />
                        {queue.fifo && <Badge variant="outline" className="text-xs">FIFO</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {getTierBadge(queue.tier)}
                        <span className="text-muted-foreground">
                          {queue.approximateNumberOfMessages || 0} msgs
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            purgeQueue(queue.name)
                          }}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === `${queue.name}-purge` ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowPathIcon className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteQueue(queue.name)
                          }}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === `${queue.name}-delete` ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            <TrashIcon className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Queue Details */}
            <Card className="flex-1 flex items-center justify-center text-muted-foreground">
              {selectedQueue ? (
                <div className="text-center p-8">
                  <QueueListIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="font-semibold text-lg mb-2">{selectedQueue.name}</h3>
                  <p className="text-sm mb-4">{selectedQueue.description || "No description"}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Tier</div>
                      <div>{getTierBadge(selectedQueue.tier)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Type</div>
                      <div>{selectedQueue.fifo ? "FIFO" : "Standard"}</div>
                    </div>
                  </div>
                  
                  {queueDetails && (
                    <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{queueDetails.approximateNumberOfMessages || 0}</div>
                        <div className="text-muted-foreground">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{queueDetails.approximateNumberOfMessagesInFlight || 0}</div>
                        <div className="text-muted-foreground">In Flight</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-600">{queueDetails.approximateNumberOfMessagesDelayed || 0}</div>
                        <div className="text-muted-foreground">Delayed</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab("messages")}
                    >
                      <InboxIcon className="w-4 h-4 mr-2" />
                      Manage Messages
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab("metrics")}
                    >
                      <ChartBarIcon className="w-4 h-4 mr-2" />
                      View Metrics
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <QueueListIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a queue to view details</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="flex-1 overflow-hidden">
            {selectedQueue ? (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Messages - {selectedQueue.name}</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowReceiveModal(true)}>
                      <InboxIcon className="w-4 h-4 mr-2" />
                      Receive Messages
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowBatchSendModal(true)}>
                      <ServerIcon className="w-4 h-4 mr-2" />
                      Batch Send
                    </Button>
                    <Button size="sm" onClick={() => setShowSendModal(true)}>
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>

                <Card className="flex-1 overflow-hidden">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <InboxIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No messages received</p>
                        <p className="text-sm mt-1">Click "Receive Messages" to poll for messages</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 h-full overflow-y-auto space-y-3">
                      {messages.map(message => (
                        <div key={message.messageId} className="border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="w-4 h-4 text-muted-foreground mt-1" />
                              <div>
                                <div className="font-mono text-sm">{message.messageId}</div>
                                <div className="text-xs text-muted-foreground">
                                  {message.attributes?.approximateFirstReceiveTimestamp 
                                    ? new Date(parseInt(message.attributes.approximateFirstReceiveTimestamp)).toLocaleString()
                                    : 'Unknown'}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Select onValueChange={(value) => changeMessageVisibility(message, parseInt(value))}>
                                <SelectTrigger className="w-24 h-7 text-xs">
                                  <SelectValue placeholder="Visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30s</SelectItem>
                                  <SelectItem value="60">1m</SelectItem>
                                  <SelectItem value="300">5m</SelectItem>
                                  <SelectItem value="600">10m</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                onClick={() => deleteMessage(message)}
                                disabled={actionLoading === `${message.messageId}-delete`}
                              >
                                {actionLoading === `${message.messageId}-delete` ? (
                                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                ) : (
                                  <TrashIcon className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-black/5 rounded p-3 mb-3">
                            <div className="text-sm font-medium mb-1">Message Body:</div>
                            <div className="font-mono text-sm whitespace-pre-wrap">{message.body}</div>
                          </div>
                          
                          {message.messageAttributes && Object.keys(message.messageAttributes).length > 0 && (
                            <div className="text-xs">
                              <div className="font-medium mb-1">Attributes:</div>
                              <pre className="font-mono bg-black/5 p-2 rounded overflow-x-auto">
                                {JSON.stringify(message.messageAttributes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <InboxIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a queue to manage messages</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="flex-1 overflow-hidden">
            {selectedQueue ? (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Metrics - {selectedQueue.name}</h2>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fetchQueueMetrics(selectedQueue.name)}
                    disabled={metricsLoading}
                  >
                    {metricsLoading ? (
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>

                {queueMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <EyeIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.messageStats.available}</div>
                          <div className="text-sm text-muted-foreground">Messages Available</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <CpuChipIcon className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.messageStats.in_flight}</div>
                          <div className="text-sm text-muted-foreground">Messages In Flight</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-500/10 rounded-lg">
                          <ClockIcon className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.messageStats.delayed}</div>
                          <div className="text-sm text-muted-foreground">Messages Delayed</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <PaperAirplaneIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.timeSeries.reduce((sum, ts) => sum + ts.messagesSent, 0)}</div>
                          <div className="text-sm text-muted-foreground">Messages Sent</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <InboxIcon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.timeSeries.reduce((sum, ts) => sum + ts.messagesReceived, 0)}</div>
                          <div className="text-sm text-muted-foreground">Messages Received</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{queueMetrics.timeSeries.reduce((sum, ts) => sum + ts.messagesDeleted, 0)}</div>
                          <div className="text-sm text-muted-foreground">Messages Deleted</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : metricsLoading ? (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Loading metrics...</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Click Refresh to load metrics</p>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a queue to view metrics</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Queue Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Create Message Queue</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="queue-name">Queue Name*</Label>
                <Input
                  id="queue-name"
                  placeholder="my-queue"
                  value={newQueue.name}
                  onChange={e => setNewQueue({...newQueue, name: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Alphanumeric characters, hyphens, and underscores only
                </p>
              </div>

              <div>
                <Label htmlFor="queue-description">Description</Label>
                <Textarea
                  id="queue-description"
                  placeholder="Queue description"
                  value={newQueue.description}
                  onChange={e => setNewQueue({...newQueue, description: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="queue-tier">Tier</Label>
                <Select value={newQueue.tier} onValueChange={v => setNewQueue({...newQueue, tier: v})}>
                  <SelectTrigger id="queue-tier" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - $5/month</SelectItem>
                    <SelectItem value="standard">Standard - $15/month</SelectItem>
                    <SelectItem value="premium">Premium - $50/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="queue-fifo"
                  checked={newQueue.fifo} 
                  onCheckedChange={v => setNewQueue({...newQueue, fifo: v})}
                />
                <Label htmlFor="queue-fifo">FIFO Queue (First-In-First-Out)</Label>
              </div>

              {createError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setCreateError(null)}>Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={createQueue}
                  disabled={createLoading || !newQueue.name}
                >
                  {createLoading ? "Creating..." : "Create Queue"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Message Modal */}
        <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Send Message</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="message-body">Message Body*</Label>
                <Textarea
                  id="message-body"
                  placeholder="Enter your message..."
                  value={messageForm.messageBody}
                  onChange={e => setMessageForm({...messageForm, messageBody: e.target.value})}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="delay-seconds">Delay Seconds</Label>
                <Input
                  id="delay-seconds"
                  type="number"
                  min="0"
                  max="900"
                  value={messageForm.delaySeconds}
                  onChange={e => setMessageForm({...messageForm, delaySeconds: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">0-900 seconds</p>
              </div>

              <div>
                <Label htmlFor="message-attributes">Message Attributes (JSON)</Label>
                <Textarea
                  id="message-attributes"
                  placeholder='{"Author": {"dataType": "String", "stringValue": "John Doe"}}'
                  value={messageForm.attributes}
                  onChange={e => setMessageForm({...messageForm, attributes: e.target.value})}
                  className="mt-1 font-mono"
                  rows={3}
                />
              </div>

              {sendError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {sendError}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setSendError(null)}>Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={sendMessage}
                  disabled={sendLoading || !messageForm.messageBody}
                >
                  {sendLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Send Modal */}
        <Dialog open={showBatchSendModal} onOpenChange={setShowBatchSendModal}>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Batch Send Messages</DialogTitle>
            <div className="space-y-4 mt-4">
              {batchMessages.map((msg, index) => (
                <div key={msg.id} className="space-y-2">
                  <Label>Message {index + 1}</Label>
                  <Textarea
                    placeholder={`Message ${index + 1} body...`}
                    value={msg.messageBody}
                    onChange={e => {
                      const updated = [...batchMessages]
                      updated[index].messageBody = e.target.value
                      setBatchMessages(updated)
                    }}
                    rows={2}
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBatchMessages([...batchMessages, { id: `msg${batchMessages.length + 1}`, messageBody: "" }])}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Message
                </Button>
                {batchMessages.length > 2 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBatchMessages(batchMessages.slice(0, -1))}
                  >
                    Remove Last
                  </Button>
                )}
              </div>

              {sendError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {sendError}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setSendError(null)}>Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={batchSendMessages}
                  disabled={sendLoading}
                >
                  {sendLoading ? "Sending..." : "Send Messages"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receive Messages Modal */}
        <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Receive Messages</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="max-messages">Max Number of Messages</Label>
                <Input
                  id="max-messages"
                  type="number"
                  min="1"
                  max="10"
                  value={receiveForm.maxNumberOfMessages}
                  onChange={e => setReceiveForm({...receiveForm, maxNumberOfMessages: parseInt(e.target.value) || 1})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">1-10 messages</p>
              </div>

              <div>
                <Label htmlFor="wait-time">Wait Time Seconds</Label>
                <Input
                  id="wait-time"
                  type="number"
                  min="0"
                  max="20"
                  value={receiveForm.waitTimeSeconds}
                  onChange={e => setReceiveForm({...receiveForm, waitTimeSeconds: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">0-20 seconds (long polling)</p>
              </div>

              <div>
                <Label htmlFor="visibility-timeout">Visibility Timeout</Label>
                <Input
                  id="visibility-timeout"
                  type="number"
                  min="0"
                  max="43200"
                  value={receiveForm.visibilityTimeout}
                  onChange={e => setReceiveForm({...receiveForm, visibilityTimeout: parseInt(e.target.value) || 30})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">0-43200 seconds</p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={receiveMessages}
                  disabled={receiveLoading}
                >
                  {receiveLoading ? "Receiving..." : "Receive Messages"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResizableLayout>
  )
}