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

// Create a server session ID that will change each time the server restarts
const SERVER_SESSION_ID = Date.now().toString();

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! Tell me about your startup idea or the problem you're trying to solve!",
      role: "assistant",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from localStorage on component mount, but only if server session matches
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    const savedMessages = localStorage.getItem('chatHistory');
    
    // Only restore messages if the session ID matches (same server instance)
    if (savedSessionId === SERVER_SESSION_ID && savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Error parsing saved messages:", e);
        // If there's an error, just use the default initial message
      }
    } else {
      // New server session, save the new session ID
      localStorage.setItem('chatSessionId', SERVER_SESSION_ID);
      // Clear any existing chat history
      localStorage.removeItem('chatHistory');
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the initial message
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

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
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[90vh] border rounded-lg shadow-sm overflow-hidden bg-[#0a0e17]">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0a0e17]">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-white mr-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h2 className="font-semibold text-lg text-white">Patent Black Hole</h2>
        </div>
        <div className="text-sm text-gray-400">Model: Incubate 1.0</div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0e17]">
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
                message.role === "user" ? "bg-blue-600 text-white" : "bg-[#1e2330] text-white",
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
            <div className="rounded-lg px-5 py-3 bg-[#1e2330]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse"
                  style={{ animationDelay: "600ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-[#1e2330] bg-[#0a0e17]">
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