'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, User, Loader2, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuthToken } from '@/lib/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { text: "What are the best career options for PCM stream?", icon: GraduationCap },
  { text: "How should I prepare for JEE Mains in 6 months?", icon: BookOpen },
  { text: "What scholarships are available for Class 12 girls?", icon: Sparkles }
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Career Coach. I can help you explore career paths in India, plan for exams like JEE, NEET, or CUET, find scholarships, and build skill roadmaps. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a simple session ID
    setSessionId(Math.random().toString(36).substring(7));
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}` // Dynamic auth token
        },
        body: JSON.stringify({
          content: textToSend,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('API server offline');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: data.id || Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn("Backend offline or error. Falling back to local mock response.", err);
      
      // Client-side rule responder fallback
      setTimeout(() => {
        let reply = "I understand you are looking for guidance. Let me evaluate that for you. Based on the standard PCM/PCB streams in India, the most optimal routes often involve focusing on entrance criteria and building core skill milestones. Would you like to check out the 'Skill Roadmaps' page to get started?";
        
        const textLower = textToSend.toLowerCase();
        if (textLower.includes('jee') || textLower.includes('engineering') || textLower.includes('pcm')) {
          reply = "For PCM students, Engineering (B.Tech) at NITs/IITs remains highly valued. Other major streams include B.Sc in Data Science, BCA + MCA, or B.Arch. I recommend taking full-length mock tests for JEE Mains and analyzing your weak topics. Would you like me to generate a study checklist?";
        } else if (textLower.includes('neet') || textLower.includes('medical') || textLower.includes('pcb')) {
          reply = "For PCB students, MBBS is the primary target but cutoffs are high. Excellent alternatives include BDS (Dental), B.V.Sc (Veterinary), B.Pharma, or Biotechnology. I recommend looking into the 'Scholarships' section to offset private college fees if needed. Which of these paths interests you?";
        } else if (textLower.includes('scholarship') || textLower.includes('money') || textLower.includes('fees')) {
          reply = "There are numerous central and state scholarships in India (like the Central Sector Scheme or Pragati Scheme). They match based on class 12 marks, family income, and reservation categories. You can review and save them on our 'Scholarships' tab. What is your class 12 score and family income range?";
        }

        const assistantMsg: Message = {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] max-h-[850px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" /> AI Career Coach
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chat with our intelligent guidance bot about study plans, colleges, stream selection, and jobs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden items-stretch">
        {/* Left column - Quick Prompts */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="shadow-sm border-border bg-card/50">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Queries</CardTitle>
              <CardDescription className="text-[10px]">Click any query to ask the career coach instantly.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2.5">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg border border-border bg-secondary/15 hover:bg-secondary/30 transition-all text-xs font-medium flex gap-2.5 items-start disabled:opacity-50"
                >
                  <p.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{p.text}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Chat Window */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden border border-border rounded-xl bg-card shadow-sm">
          {/* Chat Messages */}
          <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4 min-h-[350px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                    m.role === 'user'
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}
                >
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary/40 text-foreground rounded-tl-none border border-border/60'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-indigo-500/10 border-indigo-500/20 text-indigo-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Coach is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-border bg-secondary/10 flex gap-2.5 items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about college cutoffs, careers, roadmap preparation..."
              className="flex-grow bg-background text-sm h-11 border-border/80"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-11 px-5 flex items-center justify-center gap-1.5"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
