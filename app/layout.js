'use client'

'use client'

import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutGrid, 
  Bot, 
  Workflow, 
  Rocket, 
  Users2,
  Map,
  Book,
  Settings,
  Music, 
  Combine,
  Zap,
  X,
  Shield,
  ChevronRight,
  ArrowRight,
  Menu
} from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIProvider } from '../app/context/AIContext'
import Link from "next/link"
import { useState } from "react"

const siteConfig = {
  name: 'NobrainerAI',
  description: 'NobrainerAI is a AI tools platform',
  keywords: ['AI', 'podcast', 'generate ai podcast'],
  authors: [{ name: 'NoBrainer Team' }],
  creator: 'PodcasterAI',
  themeColor: '#22D3EE',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

const categories = [
  { 
    name: 'Dashboard', 
    path: '/',
    icon: <LayoutGrid size={20} />,
    gradient: 'from-indigo-900 to-purple-950',
    description: 'Comprehensive overview and insights'
  },
  { 
    name: 'AI Agents', 
    path: '/agents',
    icon: <Bot size={20} />,
    gradient: 'from-emerald-900 to-teal-950',
    description: 'Intelligent automation solutions'
  },
  { 
    name: 'AI Chatbot', 
    path: '/rag',
    icon: <Bot size={20} />,
    gradient: 'from-emerald-900 to-teal-950',
    description: 'Intelligent automation solutions'
  },

  { 
    name: 'Audio Generate', 
    path: '/audio',
    icon: <Music size={20} />,
    gradient: 'from-blue-900 to-cyan-950',
    description: 'Smart programming assistants'
  },
  { 
    name: 'Image Generate', 
    path: '/image',
    icon: <Combine size={20} />,
    gradient: 'from-rose-900 to-pink-950',
    description: 'Creative writing and content tools'
  },
  { 
    name: 'AI Vision', 
    path: '/vision',
    icon: <Workflow size={20} />,
    gradient: 'from-violet-900 to-fuchsia-950',
    description: 'Streamline complex processes'
  },
  { 
    name: 'AI Mindmap', 
    path: '/mindmap',
    icon: <Map size={20} />,
    gradient: 'from-yellow-900 to-white-950',
    description: 'Streamline complex processes'
  },
  { 
    name: 'Document Generator', 
    path: '/document',
    icon: <Book size={20} />,
    gradient: 'from-pink-900 to-fuchsia-950',
    description: 'Streamline complex processes'
  },
  { 
    name: 'Model Compare', 
    path: '/compare',
    icon: <Users2 size={20} />,
    gradient: 'from-yellow-900 to-green-950',
    description: 'Streamline complex processes'
  },
  { 
    name: 'Settings', 
    path: '/settings',
    icon: <Settings size={20} />,
    gradient: 'from-orange-900 to-red-950',
    description: 'Streamline complex processes'
  }
]


const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNavigation = (path) => {
    router.push(path)
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900 rounded-lg text-gray-200 hover:bg-gray-800"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-screen bg-gray-950/95 backdrop-blur-lg border-r border-gray-800
        transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'w-[85%]' : 'w-96'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-950/95 backdrop-blur-lg z-10 border-b border-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
                  <Zap className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
                    {siteConfig.name}
                  </h2>
                  <p className="text-sm text-gray-400 tracking-wide">
                    {siteConfig.description}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-full p-3 shadow-md hover:scale-105 transition-transform">
                <Shield className="text-gray-300" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="p-5 space-y-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleNavigation(category.path)}
                  className={`
                    group w-full flex items-center justify-between 
                    px-5 py-4 rounded-2xl transition-all duration-300 relative
                    ${pathname === category.path 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl' 
                      : 'hover:bg-gray-900 text-gray-400 hover:text-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center space-x-5">
                    <div className={`
                      p-3 rounded-xl bg-gradient-to-br ${category.gradient} 
                      shadow-lg transform transition-transform group-hover:scale-110
                    `}>
                      {React.cloneElement(category.icon, { 
                        className: 'text-white', 
                        size: 24 
                      })}
                    </div>
                    <div className="text-left">
                      <span className="text-base font-bold block">{category.name}</span>
                      <span className="text-xs text-gray-500 opacity-75">
                        {category.description}
                      </span>
                    </div>
                  </div>
                  
                  {pathname === category.path ? (
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white text-xs px-3 py-1.5 rounded-full shadow-md">
                      Active
                    </div>
                  ) : (
                    <ChevronRight 
                      className="text-gray-600 group-hover:text-gray-300 transition-colors" 
                      size={24} 
                    />
                  )}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Upgrade Section */}
        <div className="flex-shrink-0 p-5 border-t border-gray-800 bg-gray-950/95">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base font-bold text-white mb-3 flex items-center">
                Upgrade to Enterprise
                <span className="ml-3 bg-indigo-700 text-white text-xs px-2.5 py-1 rounded-full shadow-md">
                  New
                </span>
              </h3>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Unlock enterprise-grade AI templates, advanced features, and comprehensive tool access
              </p>
              <Link href='/pricing'>
                <button className="w-full bg-white/10 text-white text-sm py-3.5 rounded-xl hover:bg-white/20 transition-colors font-bold shadow-lg flex items-center justify-center group border border-white/20">
                  Upgrade Now
                  <ArrowRight 
                    className="ml-2 group-hover:translate-x-1 transition-transform" 
                    size={18} 
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>{siteConfig.name}</title>
        </head>
        <body>
          <Toaster />
          <AIProvider>
            <div className="flex min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
              <Sidebar />
              <main className="flex-1 ml-0 lg:ml-96 bg-transparent ">
                {children}
              </main>
            </div>
          </AIProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}