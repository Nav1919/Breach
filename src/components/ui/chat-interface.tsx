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
      content: "Hello! Tell me about your invention idea or the problem you're trying to solve, and I'll help you discover unique innovation opportunities!",
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
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[90vh] border rounded-lg shadow-sm overflow-hidden bg-background">
      {/* Header with Back Button */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mr-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h2 className="font-semibold text-lg">Patent Black Hole</h2>
        </div>
        <div className="text-sm text-muted-foreground">Patent Gap Finder</div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn("flex items-start gap-4 animate-in fade-in duration-200", {
              "justify-end": message.role === "user",
            })}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}

            <div
              className={cn(
                "rounded-lg px-5 py-3 max-w-[85%] break-words",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {message.role === "assistant" ? (
                <div 
                  className="text-base whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
                />
              ) : (
                <p className="text-base">{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-secondary" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="rounded-lg px-5 py-3 bg-muted">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 animate-pulse"
                  style={{ animationDelay: "600ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t">
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
            className="flex-1 text-base py-6"
            disabled={isLoading}
          />
          {/* Fixed button with explicit icon rendering */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || input.trim() === ""}
            className="transition-all h-12 w-12 rounded-full flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <div className="mt-3 text-sm text-center text-muted-foreground">
          AI assistant may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  )
}