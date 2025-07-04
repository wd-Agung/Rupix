'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useDesignStore } from '@/lib/stores/design-store'
import { cn } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { type ToolInvocation } from 'ai'
import { Bot, Brain, CheckCircle, ChevronRight, Loader2, Send, User } from 'lucide-react'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

interface AgentPanelProps {
  className?: string
  onCollapse?: () => void
}

interface MarkdownTextProps {
  children: string
  isUser?: boolean
}

function MarkdownText({ children, isUser }: MarkdownTextProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Style headings
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>,

        // Style paragraphs
        p: ({ children }) => <p className="mb-1 last:mb-0 whitespace-pre-wrap">{children}</p>,

        // Style lists
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,

        // Style code blocks
        code: ({ children, className }) => {
          const inline = !className?.includes('language-')
          if (inline) {
            return (
              <code className={cn(
                "px-1 py-0.5 rounded text-xs font-mono",
                isUser
                  ? "bg-blue-600 text-blue-100"
                  : "bg-gray-200 text-gray-800"
              )}>
                {children}
              </code>
            )
          }
          return (
            <code className={cn(
              "block p-2 rounded text-xs font-mono overflow-x-auto",
              isUser
                ? "bg-blue-600 text-blue-100"
                : "bg-gray-800 text-gray-100",
              className
            )}>
              {children}
            </code>
          )
        },

        // Style pre blocks (code blocks)
        pre: ({ children }) => (
          <pre className={cn(
            "p-2 rounded my-2 text-xs font-mono overflow-x-auto",
            isUser
              ? "bg-blue-600 text-blue-100"
              : "bg-gray-800 text-gray-100"
          )}>
            {children}
          </pre>
        ),

        // Style blockquotes
        blockquote: ({ children }) => (
          <blockquote className={cn(
            "border-l-4 pl-3 my-2 italic",
            isUser
              ? "border-blue-300 text-blue-100"
              : "border-gray-300 text-gray-600"
          )}>
            {children}
          </blockquote>
        ),

        // Style links
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline hover:no-underline",
              isUser
                ? "text-blue-200 hover:text-blue-100"
                : "text-blue-600 hover:text-blue-800"
            )}
          >
            {children}
          </a>
        ),

        // Style tables
        table: ({ children }) => (
          <table className="w-full border-collapse border border-gray-300 my-2 text-xs">
            {children}
          </table>
        ),
        thead: ({ children }) => (
          <thead className={cn(
            isUser ? "bg-blue-600" : "bg-gray-100"
          )}>
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 p-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 p-1">
            {children}
          </td>
        ),

        // Style horizontal rules
        hr: () => (
          <hr className={cn(
            "my-2 border-t",
            isUser ? "border-blue-300" : "border-gray-300"
          )} />
        ),

        // Style emphasis
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export function Reasoning({ reasoning }: { reasoning: string }) {
  return (
    // collapseable div
    <Collapsible>
      <CollapsibleTrigger>
        <div className="font-medium text-gray-600 mb-1">
          <Brain className="h-4 w-4" />
          Reasoning
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="text-gray-500 italic">
          <MarkdownText isUser={false}>{reasoning}</MarkdownText>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ToolInvocation({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  return (
    <div className={cn('flex flex-col gap-2 p-2 rounded-lg border-2 border-gray-200 text-xs', toolInvocation.state === 'call' ? 'bg-amber-100' : 'bg-green-100')}>
      <div className="font-medium text-gray-600 mb-1 flex items-center gap-2">
        {toolInvocation.state === 'call' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
        {toolInvocation.toolName}
      </div>
      {
        toolInvocation.state === 'result' && (
          <div className="text-gray-500 border-t border-gray-200 pt-2 italic text-sm bg-gray-50 p-2 rounded-lg">
            <MarkdownText isUser={false}>
              {typeof toolInvocation.result === 'string'
                ? toolInvocation.result
                : JSON.stringify(toolInvocation.result, null, 2)}
            </MarkdownText>
          </div>
        )
      }
    </div>
  )
}

export function AgentPanel({ className, onCollapse }: AgentPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const executeCanvasTool = useDesignStore((state) => state.executeCanvasTool)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    maxSteps: 10,
    onToolCall: ({ toolCall }) => {
      return executeCanvasTool(toolCall.toolName, toolCall.args)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  console.log(messages)

  return (
    <Card className={cn('min-w-80 w-full border-none shadow-none h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent
          </div>
          {onCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'flex items-start gap-2 max-w-[85%]',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {
                    message.parts?.map((part, index) => {
                      switch (part.type) {
                        case 'text':
                          return <MarkdownText key={index} isUser={message.role === 'user'}>{part.text}</MarkdownText>
                        case 'tool-invocation':
                          return <ToolInvocation key={index} toolInvocation={part.toolInvocation} />
                        case 'reasoning':
                          return <Reasoning key={index} reasoning={part.reasoning} />
                        case 'step-start':
                          return index > 0 ? (
                            <div key={index} className="text-gray-500">
                              <hr className="my-2 border-gray-300" />
                            </div>
                          ) : null;
                        default:
                          return null
                      }
                    })
                  }

                  <div
                    className={cn(
                      'text-xs mt-1 opacity-70',
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}
                  >
                    {formatTime(new Date())}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t pt-4">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Ask me to create shapes, move objects, change colors..."
                className="flex-1 min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 