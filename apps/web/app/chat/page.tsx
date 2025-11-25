"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, Sparkles, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { chatWithElisa, getElisaSuggestions, clearElisaMemory, getElisaAnalysis } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  timestamp: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm ElisaOs, your AI financial assistant. How can I help you today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [elisaOnline, setElisaOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userAddress = "GXXXXX..."; // Would come from wallet

  useEffect(() => {
    // Load suggestions on mount
    loadSuggestions();
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSuggestions = async () => {
    const data = await getElisaSuggestions(userAddress);
    if (data && data.suggestions) {
      setSuggestions(data.suggestions);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithElisa(userAddress, text);
      
      if (response.response.includes("offline")) {
        setElisaOnline(false);
      } else {
        setElisaOnline(true);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        suggestions: response.suggestions,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
      setElisaOnline(false);
    }

    setLoading(false);
  };

  const quickAnalysis = async (type: "credit" | "loan" | "risk") => {
    setLoading(true);
    const analysis = await getElisaAnalysis(userAddress, type);
    
    if (analysis && analysis.analysis) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `📊 **${type.toUpperCase()} Analysis:**\n\n${analysis.analysis}`,
        timestamp: Date.now()
      }]);
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await clearElisaMemory(userAddress);
    setMessages([{
      role: "assistant",
      content: "✨ Memory cleared! How can I help you today?",
      timestamp: Date.now()
    }]);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <img src="/images/logo.png" alt="StellarCredit" className="h-8 w-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Chat with ElisaOs
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${elisaOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${elisaOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs">{elisaOnline ? 'Online' : 'Offline'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat}>
            <Trash2 className="h-5 w-5" />
          </Button>
          <Bot className="h-8 w-8 text-purple-500" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Quick Actions */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button
            onClick={() => quickAnalysis("credit")}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Credit Analysis
          </Button>
          <Button
            onClick={() => quickAnalysis("loan")}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Loan Recommendations
          </Button>
          <Button
            onClick={() => quickAnalysis("risk")}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Risk Assessment
          </Button>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    
                    {/* Suggestions from AI */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(suggestion)}
                            className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-full transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-zinc-100 p-4 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Ask about your credit, loans, or get financial advice..."
                className="bg-zinc-800 border-zinc-700 text-white flex-1"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Suggestions */}
            <div className="mt-4">
              <p className="text-xs text-zinc-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    disabled={loading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
