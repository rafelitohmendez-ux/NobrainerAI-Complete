'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, Image, FileText, Mic, Paperclip, AtSign,User2, Menu, ChevronDown, Zap, Shield, ArrowRight, Loader, Send, PenTool, Bot, Music, HardDriveDownload, Paintbrush, Map, AppWindow } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAI } from './context/AIContext'
import { sendMessageToProvider } from './services/chatServices'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [showNobrainer, setShowNobrainer] = useState(true)
  const { provider, model, apiKey, isProcessing, setIsProcessing, generationType } = useAI()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isProcessing])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100">
      <div className="flex">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center mb-4">
              <Badge variant="secondary" className="text-green-400 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30">
                ✨ Introducing: Image Vision AI
              </Badge>
            </div>
            
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-800 to-purple-900 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
                  NobrainerAI
                </h1>
              </div>
            </div>

            {showNobrainer && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">All Categories</h2>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      View all (6)
                    </Button>
                  </div>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <AgentCard
                    icon="youtube"
                    title="AI Assistant"
                    description="Smart AI assistant for various tasks and queries"
                    href="/tool/ai-assistant"
                  />
                  <AgentCard
                    icon="email"
                    title="Podcast Creator"
                    description="Generate engaging audio content and podcasts"
                    href="/podcast"
                  />
                  <AgentCard
                    icon="code"
                    title="Image Generator"
                    description="Create custom images and illustrations"
                    href="/tool/image-generator"
                  />
                  <AgentCard
                    icon="blog"
                    title="AI Visual Analysis"
                    description="Process Images and chat with it"
                    href="/tool/visual-analysis"
                  />
                  <AgentCard
                    icon="copywriting"
                    title="Mind Mapper"
                    description="Create interactive mind maps and diagrams"
                    href="/tool/mind-mapper"
                  />
                  <AgentCard
                    icon="chatbot"
                    title="Document Builder"
                    description="Generate professional documents and reports"
                    href="/tool/document-builder"
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AgentCard({ icon, title, description }) {
  const getIcon = () => {
    switch (icon) {
      case 'youtube':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-6 text-white" />
          </div>
        )
      case 'email':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl flex items-center justify-center shadow-lg">
            <Music className="w-8 h-6 text-white" />
          </div>
        )
      case 'code':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
            <Paintbrush className="w-8 h-6 text-white" />
          </div>
        )
      case 'blog':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
            <Image className="w-8 h-6 text-white" />
          </div>
        )
      case 'copywriting':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg">
            <Map className="w-8 h-6 text-white" />
          </div>
        )
      case 'chatbot':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-6 text-white" />
          </div>
        )
        case 'ugc':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-800 rounded-xl flex items-center justify-center shadow-lg">
            <User2 className="w-8 h-6 text-white" />
          </div>
        ) 
        case 'website':
          return (
            <div className="w-10 h-10 bg-white-to-br from-black-600 to-orange-800 rounded-xl flex items-center justify-center shadow-lg">
              <AppWindow className="w-8 h-6 text-white" />
            </div>
          ) 
      default:
        return null
    }
  }

  return (
    <Card className="p-4 bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer rounded-xl shadow-lg group">
      <div className="flex items-start gap-4">
        {getIcon()}
        <div>
          <h3 className="font-semibold mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-300 transition-colors">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </Card>
  )
}
