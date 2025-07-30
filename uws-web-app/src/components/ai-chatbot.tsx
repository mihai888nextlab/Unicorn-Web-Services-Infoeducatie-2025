"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your UWS assistant. I can help with billing, usage, and optimization. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(input),
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("billing") || lowerInput.includes("cost") || lowerInput.includes("payment")) {
      return "Your current month cost is $247.50. You can reduce costs by optimizing underutilized compute instances (~$25/month savings) and setting up storage lifecycle policies (~$15/month savings)."
    }

    if (lowerInput.includes("storage") || lowerInput.includes("s3")) {
      return "You're using 2.4 TB of 5 TB storage (48% used), costing $58.40 this month. Consider archiving old data to reduce costs."
    }

    if (lowerInput.includes("compute") || lowerInput.includes("server")) {
      return "You have 12 active instances costing $89.60/month. 3 instances are underutilized - downsizing them could save ~$25/month."
    }

    if (lowerInput.includes("optimize") || lowerInput.includes("save")) {
      return "Here are quick wins: 1) Downsize 3 underutilized servers (~$25/month), 2) Archive old storage (~$15/month), 3) Your functions are already optimized!"
    }

    return "I can help with billing, usage optimization, and service management. Try asking about costs, storage, or compute optimization."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: "Show costs", query: "What are my current costs?" },
    { label: "Optimize", query: "How can I optimize my usage?" },
    { label: "Storage usage", query: "Show my storage usage" },
  ]

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-foreground hover:bg-foreground/90 text-background shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-xl z-50 flex flex-col">
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      message.role === "user" ? "bg-foreground text-background" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
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
                onKeyPress={handleKeyPress}
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
