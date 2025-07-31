"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isError?: boolean
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateeContent'

const SYSTEM_PROMPT = `You are the official AI assistant for Unicorn Web Services (UWS), a comprehensive cloud platform. You are knowledgeable about all UWS features and help users navigate, understand, and optimize their cloud infrastructure.

## RESPONSE GUIDELINES:
- Keep responses SHORT and CONCISE (maximum 3-4 sentences for simple questions)
- Use bullet points for lists instead of long paragraphs
- Be direct and to-the-point
- Focus on actionable information
- Avoid lengthy explanations unless specifically requested
- Use emojis sparingly for key points only

## UWS PLATFORM OVERVIEW

UWS provides 6 core cloud services:

### 1. OBJECT STORAGE (S3 Compatible)
- S3-compatible API for file storage
- Public/Private bucket configuration
- Drag & drop file uploads, preview, and download
- Object lifecycle management
- Pricing: $0.023/GB/month
- Features: File versioning, metadata, custom keys
- Location: /app/services/storage

### 2. DATABASE SERVICES
- PostgreSQL and MongoDB (NoSQL) databases
- High availability with automated backups
- Query editor with advanced filtering ($eq, $ne, $gt, $gte, $lt, $lte, $in, $regex, $exists)
- Collection/table management
- Real-time query execution
- Pricing: From $25/month
- Location: /app/services/database

### 3. COMPUTE SERVICES
- Docker container deployment
- Auto-scaling and load balancing
- Custom container images
- CPU/Memory configuration
- Instance lifecycle management
- Pricing: From $0.05/hour
- Location: /app/services/compute

### 4. LAMBDA FUNCTIONS (Serverless)
- Multiple runtime support (Node.js, Python, etc.)
- Event-driven execution
- Built-in code editor with syntax highlighting
- Version control and deployment
- Environment variables and configurations
- Pricing: $0.20/1M requests
- Location: /app/services/lambda

### 5. MESSAGE QUEUE SERVICE
- FIFO and standard queues
- Dead letter queue configuration
- Batch operations and long polling
- Message attributes and metadata
- Queue monitoring and metrics
- Free tier available
- Location: /app/services/queue

### 6. SECRETS MANAGER
- Encrypted storage for API keys, passwords, and configs
- Hierarchical secret organization with paths
- Version history and secret sharing
- Access control and expiration dates
- Tags and metadata support
- Pricing: $0.40/secret/month
- Location: /app/services/secrets

## MONITORING & ANALYTICS
- Comprehensive CloudWatch-style monitoring at /app/monitoring
- Real-time metrics for all services
- Custom alarms and notifications
- Resource utilization tracking
- Cost optimization recommendations

## BILLING & USAGE
- Detailed billing dashboard at /app/billing
- Usage analytics and cost breakdown
- Budget alerts and spending limits
- Cost optimization suggestions
- Payment method management

## KEY FEATURES TO HIGHLIGHT:
1. **Integrated Ecosystem**: All services work seamlessly together
2. **Developer-Friendly**: Built-in editors, APIs, and automation
3. **Cost-Effective**: Competitive pricing with free tiers
4. **Enterprise-Ready**: High availability, security, and compliance
5. **Real-time Monitoring**: Complete observability across all services

## YOUR ROLE AS UWS ASSISTANT:
- Help users understand service capabilities and use cases
- Guide users to the right service for their needs
- Explain pricing and cost optimization strategies
- Troubleshoot common issues and provide solutions
- Suggest best practices for architecture and deployment
- Help navigate the platform and find specific features
- Provide code examples and configuration guidance when relevant

Always be helpful, accurate, and focused on UWS capabilities. When users ask about features, direct them to the appropriate service page and explain how to accomplish their goals using UWS tools.`

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "👋 Hi! I'm your UWS AI assistant. I can help you with:\n\n🏗️ Understanding our 6 cloud services\n💰 Billing and cost optimization\n📊 Monitoring and analytics\n🔧 Troubleshooting and best practices\n\nWhat would you like to know about UWS?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      await getGeminiResponse(currentInput)
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore our services directly through the navigation menu.",
        role: "assistant",
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getGeminiResponse = async (userInput: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser question: ${userInput}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.candidates[0].content.parts[0].text,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } else {
      throw new Error('Invalid response from Gemini API')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: "🏗️ Services overview", query: "What services does UWS offer?" },
    { label: "💰 Pricing guide", query: "How much do UWS services cost?" },
    { label: "🚀 Getting started", query: "How do I get started with UWS?" },
    { label: "📊 Monitoring", query: "How can I monitor my resources?" },
  ]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  // Format message content with enhanced styling
  const formatMessageContent = (content: string) => {
    const lines = content.split('\n')
    
    return lines.map((line, index) => {
      // Headers (lines starting with ##)
      if (line.startsWith('## ')) {
        return (
          <div key={index} className="font-semibold text-base mt-3 mb-2 text-primary">
            {line.replace('## ', '')}
          </div>
        )
      }
      
      // Subheaders (lines starting with ###)
      if (line.startsWith('### ')) {
        return (
          <div key={index} className="font-medium text-sm mt-2 mb-1 text-foreground/90">
            {line.replace('### ', '')}
          </div>
        )
      }
      
      // Bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <div key={index} className="mb-1">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <span key={partIndex} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </span>
                )
              }
              return formatInlineContent(part, partIndex)
            })}
          </div>
        )
      }
      
      // Lists (lines starting with - or numbered)
      if (line.match(/^[\s]*[-•]\s/) || line.match(/^[\s]*\d+\.\s/)) {
        return (
          <div key={index} className="ml-2 mb-1 flex items-start gap-2">
            <span className="text-primary mt-1 text-xs">•</span>
            <span>{formatInlineContent(line.replace(/^[\s]*[-•]\s/, '').replace(/^[\s]*\d+\.\s/, ''))}</span>
          </div>
        )
      }
      
      // Code blocks or inline code (text with backticks)
      if (line.includes('`')) {
        const parts = line.split(/(`[^`]+`)/g)
        return (
          <div key={index} className="mb-1">
            {parts.map((part, partIndex) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={partIndex} className="bg-muted/60 px-1.5 py-0.5 rounded text-xs font-mono border">
                    {part.slice(1, -1)}
                  </code>
                )
              }
              return formatInlineContent(part, partIndex)
            })}
          </div>
        )
      }
      
      // Pricing or money amounts
      if (line.includes('$') && line.match(/\$[\d,]+(\.\d{2})?/)) {
        return (
          <div key={index} className="mb-1">
            {line.split(/(\$[\d,]+(?:\.\d{2})?(?:\/[^.\s]*)?)/g).map((part, partIndex) => {
              if (part.match(/\$[\d,]+(?:\.\d{2})?(?:\/[^.\s]*)?/)) {
                return (
                  <span key={partIndex} className="font-semibold text-green-600 dark:text-green-400">
                    {part}
                  </span>
                )
              }
              return formatInlineContent(part, partIndex)
            })}
          </div>
        )
      }
      
      // Emojis at start of line (feature callouts)
      if (line.match(/^[🔥💡⚡🚀📊💰🏗️🔧⭐✅❌⚠️]/)) {
        return (
          <div key={index} className="mb-2 p-2 bg-muted/30 rounded-lg border-l-2 border-primary/50">
            <span className="text-base">{line}</span>
          </div>
        )
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <div key={index} className="mb-1">
            {formatInlineContent(line)}
          </div>
        )
      }
      
      // Empty lines for spacing
      return <div key={index} className="h-2" />
    })
  }

  // Format inline content (URLs, paths, etc.)
  const formatInlineContent = (text: string, key: number = 0) => {
    // URLs
    if (text.includes('http')) {
      const parts = text.split(/(https?:\/\/[^\s]+)/g)
      return parts.map((part, index) => {
        if (part.match(/https?:\/\/[^\s]+/)) {
          return (
            <a key={`${key}-${index}`} href={part} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800">
              {part}
            </a>
          )
        }
        return <span key={`${key}-${index}`}>{part}</span>
      })
    }
    
    // File paths (/app/...)
    if (text.includes('/app/')) {
      const parts = text.split(/(\/(app\/[^\s,]+))/g)
      return parts.map((part, index) => {
        if (part.match(/\/(app\/[^\s,]+)/)) {
          return (
            <code key={`${key}-${index}`} className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded text-xs font-mono">
              {part}
            </code>
          )
        }
        return <span key={`${key}-${index}`}>{part}</span>
      })
    }
    
    return <span key={key}>{text}</span>
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-foreground hover:bg-foreground/90 text-background shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                <SparklesIcon className="w-3 h-3 text-background" />
              </div>
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm break-words ${
                      message.role === "user" 
                        ? "bg-foreground text-background" 
                        : message.isError
                        ? "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.isError && (
                      <div className="flex items-center gap-1 mb-1">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">Connection Error</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {formatMessageContent(message.content)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-full bg-transparent"
                    onClick={() => setInput(action.query)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 rounded-full border-muted-foreground/20 focus:border-foreground"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-full bg-foreground hover:bg-foreground/90 text-background"
                size="icon"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
