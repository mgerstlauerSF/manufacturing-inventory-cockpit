import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Search,
  Database,
  Copy,
  Check,
  X
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  toolCalls?: ToolCall[]
  sql?: string
  isStreaming?: boolean
  isError?: boolean
}

interface Source {
  title: string
  snippet?: string
  score?: number
}

interface ToolCall {
  name: string
  type: 'cortex_analyst' | 'cortex_search' | 'custom'
  status: 'pending' | 'running' | 'complete' | 'error'
  sql?: string
  output?: any
  duration?: number
}

type ThinkingStage = 'idle' | 'classifying' | 'searching' | 'analyzing' | 'generating'

interface CortexAgentChatProps {
  agentEndpoint: string
  agentName?: string
  welcomeMessage?: string
  suggestedQuestions?: string[]
  onContextUpdate?: (context: any) => void
  isOpen: boolean
  onClose: () => void
}

function AIThinking({ stage, toolName }: { stage: ThinkingStage; toolName?: string }) {
  const stages = {
    idle: { icon: Brain, text: 'Ready', color: 'slate' },
    classifying: { icon: Brain, text: 'Understanding...', color: 'purple' },
    searching: { icon: Search, text: toolName ? `Searching ${toolName}...` : 'Searching...', color: 'green' },
    analyzing: { icon: Database, text: 'Analyzing data...', color: 'blue' },
    generating: { icon: Sparkles, text: 'Generating response...', color: 'cyan' },
  }

  const current = stages[stage]
  const Icon = current.icon

  if (stage === 'idle') return null

  return (
    <div className="flex items-center gap-3 p-3">
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
          <Icon size={16} className="text-accent-blue" />
        </div>
      </div>
      <span className="text-sm text-slate-400">{current.text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.role === 'user'
          ? 'bg-gradient-to-br from-accent-blue to-accent-cyan'
          : 'bg-gradient-to-br from-navy-600 to-navy-700 ring-1 ring-navy-500'
      }`}>
        {message.role === 'user' ? (
          <User size={14} className="text-white" />
        ) : (
          <Sparkles size={14} className="text-accent-blue" />
        )}
      </div>

      <div className={`max-w-[80%] rounded-2xl p-3 group relative ${
        message.role === 'user'
          ? 'bg-gradient-to-br from-accent-blue to-accent-blue/80 text-white'
          : message.isError
            ? 'bg-red-900/30 text-red-200 ring-1 ring-red-700'
            : 'bg-navy-700/80 text-slate-200 ring-1 ring-navy-600'
      }`}>
        {message.isStreaming && !message.content ? (
          <AIThinking stage="generating" />
        ) : (
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        )}

        {message.role === 'assistant' && !message.isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-navy-600"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-slate-400" />}
          </button>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-navy-600/50">
            <p className="text-xs text-slate-400 mb-1">Sources:</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-navy-600/50 text-accent-blue rounded-full"
                >
                  {source.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CortexAgentChat({
  agentEndpoint,
  agentName = 'AI Assistant',
  welcomeMessage = "Hello! I'm your Manufacturing Intelligence Assistant. Ask me about inventory, production, or logistics.",
  suggestedQuestions = [
    "What's the current inventory risk?",
    "Show me critical stock alerts",
    "Which logistics providers have the highest performance?",
  ],
  onContextUpdate,
  isOpen,
  onClose,
}: CortexAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingStage, setThinkingStage] = useState<ThinkingStage>('idle')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setThinkingStage('classifying')

    const placeholderId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: placeholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }])

    try {
      const response = await fetch(agentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()
      
      setThinkingStage('generating')
      
      const fullText = data.response || data.content || 'I encountered an issue processing your request.'
      let currentText = ''
      const words = fullText.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        const textToShow = currentText
        
        setMessages(prev => prev.map(msg =>
          msg.id === placeholderId
            ? { ...msg, content: textToShow, isStreaming: i < words.length - 1 }
            : msg
        ))
        
        await new Promise(resolve => setTimeout(resolve, 20))
      }

      setMessages(prev => prev.map(msg =>
        msg.id === placeholderId
          ? {
              ...msg,
              content: fullText,
              sources: data.sources,
              sql: data.sql,
              isStreaming: false,
            }
          : msg
      ))

      if (data.context && onContextUpdate) {
        onContextUpdate(data.context)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === placeholderId
          ? {
              ...msg,
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false,
              isError: true,
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setThinkingStage('idle')
    }
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[600px] bg-navy-800 rounded-2xl shadow-2xl border border-navy-700 flex flex-col z-50 animate-slide-up">
      <div className="p-4 border-b border-navy-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="text-accent-blue" size={20} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          </div>
          <h2 className="font-semibold text-slate-200">{agentName}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-navy-700 transition-colors"
          aria-label="Close chat"
        >
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && thinkingStage !== 'idle' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-700 ring-1 ring-navy-500 flex items-center justify-center">
              <Sparkles size={14} className="text-accent-blue" />
            </div>
            <div className="bg-navy-700/80 rounded-2xl ring-1 ring-navy-600">
              <AIThinking stage={thinkingStage} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(q)}
                className="text-xs px-3 py-1.5 bg-navy-700/50 text-slate-300 rounded-full 
                         hover:bg-navy-600 hover:text-white transition-all duration-200
                         ring-1 ring-navy-600 hover:ring-accent-blue/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-navy-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agentName}...`}
            className="flex-1 bg-navy-700/50 border border-navy-600 rounded-xl px-4 py-2.5 
                     text-slate-200 placeholder-slate-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
                     transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-accent-blue to-accent-blue/80 
                     hover:from-accent-blue hover:to-accent-blue
                     disabled:from-navy-600 disabled:to-navy-600 disabled:cursor-not-allowed
                     text-white font-medium px-4 py-2.5 rounded-xl 
                     transition-all duration-200 flex items-center gap-2"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default CortexAgentChat
