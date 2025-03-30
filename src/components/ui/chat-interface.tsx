"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, Bot, Loader2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! Tell me about your startup idea or the problem you're trying to solve, and I'll help you discover unique ideas!",
      role: "assistant",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (input.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Call the process API
    setIsLoading(true)
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: input }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the content from the innovations array if available
      let content = "";
      if (data.innovations && Array.isArray(data.innovations)) {
        content = data.innovations.join("\n\n");
      } else if (data.analysis) {
        content = data.analysis;
      } else {
        content = "Here's what I found based on your query.";
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: content,
        role: "assistant",
      }
      
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request. Please try again with a different description.",
        role: "assistant",
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Simple function to format text with basic formatting
  const formatText = (text: string) => {
    // Replace **text** with bold
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace newlines with br tags
    const withLineBreaks = boldFormatted.replace(/\n/g, '<br/>');
    
    return withLineBreaks;
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[90vh] border rounded-lg shadow-lg overflow-hidden bg-[#0a0e17]/90 backdrop-blur-md">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0a0e17]/95">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-white mr-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h2 className="font-semibold text-lg text-white">Your Workspace</h2>
        </div>
        <div className="text-sm text-gray-400">Model: Incubate 1.0</div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0e17]/80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-4 rounded-lg p-4",
              message.role === "assistant" ? "bg-[#1e2330]/80" : "bg-[#0d1117]/80 ml-12"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
                message.role === "assistant" ? "bg-[#2d3748]" : "bg-[#1a202c]"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium text-white">
                {message.role === "assistant" ? "Breach" : "You"}
              </div>
              <div 
                className="prose prose-sm text-gray-300"
                dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-[#1e2330] bg-[#0a0e17]/95">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your invention idea or problem..."
            className="flex-1 text-base py-6 bg-[#1e2330] border-[#2a3146] text-white"
            disabled={isLoading}
          />
          
          {/* Directly use CSS for the button styles to ensure icon visibility */}
          <button
            type="submit"
            disabled={isLoading || input.trim() === ""}
            className="flex items-center justify-center h-12 w-12 rounded-md bg-[#1e2330] border border-[#2a3146] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
        <div className="mt-3 text-sm text-center text-gray-400">
          AI assistants may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  )
}