'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Zap, Construction } from 'lucide-react'
import Link from 'next/link'

export default function ToolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Tool Interface</h1>
            <p className="text-gray-400">Powered by NobrainerAI</p>
          </div>
        </div>

        <Card className="p-12 bg-gray-900/50 border-gray-800 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Construction className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Coming Soon</h2>
          <p className="text-gray-400 max-w-md mb-8">
            The GitHub folder structure is now fixed!
          </p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
                Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
