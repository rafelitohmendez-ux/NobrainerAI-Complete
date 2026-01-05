// src/agents/page.jsx

'use client'
import React, { useState, useEffect } from 'react';
import { useGroqTool } from '@/hooks/useGroqTool';
import { Plus, Trash2, Send, PenTool, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { Inter , Outfit, Space_Grotesk} from 'next/font/google';
import { useAI } from '@/app/context/AIContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://drzaxxnujlgrxhwbxqto.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyemF4eG51amxncnhod2J4cXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3OTg5ODcsImV4cCI6MjA0ODM3NDk4N30.YoNrlmGcKfuss9WD-XgsQQNrmGjkM8aQwvFAfsI8WzY')

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

const ParameterInput = ({ onAdd }) => {
  const [parameter, setParameter] = useState({
    name: '',
    type: 'string',
    description: '',
    required: false,
    enum: '',
  });

  const handleAdd = () => {
    onAdd({
      ...parameter,
      enum: parameter.enum ? parameter.enum.split(',').map(s => s.trim()) : undefined,
    });
    setParameter({
      name: '',
      type: 'string',
      description: '',
      required: false,
      enum: '',
    });
  };

  return (
    <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-200">Parameter Name</label>
        <input
          type="text"
          value={parameter.name}
          onChange={(e) => setParameter(prev => ({ ...prev, name: e.target.value }))}
          className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">Type</label>
        <select
          value={parameter.type}
          onChange={(e) => setParameter(prev => ({ ...prev, type: e.target.value }))}
          className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="array">Array</option>
          <option value="object">Object</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">Description</label>
        <input
          type="text"
          value={parameter.description}
          onChange={(e) => setParameter(prev => ({ ...prev, description: e.target.value }))}
          className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">Enum Values</label>
        <input
          type="text"
          value={parameter.enum}
          placeholder="Value1, Value2, Value3"
          onChange={(e) => setParameter(prev => ({ ...prev, enum: e.target.value }))}
          className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={parameter.required}
          onChange={(e) => setParameter(prev => ({ ...prev, required: e.target.checked }))}
          className="rounded bg-gray-900/50 border-gray-600 text-blue-500 focus:ring-blue-500"
        />
        <label className="ml-2 text-sm text-gray-200">Required</label>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Parameter
      </button>
    </div>
  );
};

const ApiKeyCheck = ({ onValidKeyConfirmed }) => {
  const { apiKey, provider } = useAI();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (provider !== 'groq') {
      setShowError(true);
    } else {
      setShowError(false);
      if (apiKey) {
        onValidKeyConfirmed();
      }
    }
  }, [provider, apiKey]);

  if (!showError && !apiKey) {
    return (
      <div className="p-8 text-center">
        <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please set your Groq API key in the settings page to use the agent tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="p-8 text-center">
        <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Provider Selected</AlertTitle>
          <AlertDescription>
            This tool requires a Groq API key. Please switch to Groq in the settings page and enter your API key.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

const ToolForm = () => {
  const [tool, setTool] = useState({
    name: '',
    description: '',
    apiUrl: '',
    apiKey: '',
    parameters: [],
  });
  const [message, setMessage] = useState('');
  const { tools, messages, loading, error, createTool, sendMessage } = useGroqTool();
  
  const [showTools, setShowTools] = useState(false);

  const { 
    apiKey: groqApiKey, 
    provider, 
    setApiKey, 
    handleProviderChange 
  } = useAI();

  const isGroqKeyValid = provider === 'groq' && groqApiKey;

  const { user } = useUser();

  // New useEffect to load saved settings from Supabase
  // New useEffect to load saved settings from Supabase
useEffect(() => {
  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        // Set provider to saved provider or default to current
        if (data.provider && data.provider !== provider) {
          handleProviderChange(data.provider);
        }

        // Set the API key if available
        if (data.api_key) {
          setApiKey(data.api_key);
        }

        // Optional: Set generation type if needed
        if (data.generation_type) {
          setGenerationType(data.generation_type);
        }
      }
    } catch (err) {
      console.error('Unexpected error loading settings:', err);
    }
  };

  loadSettings();
}, [user]);

  const handleCreateTool = (e) => {
    e.preventDefault();
    createTool(tool);
    setTool({
      name: '',
      description: '',
      apiUrl: '',
      apiKey: '',
      parameters: [],
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(message);
    setMessage('');
  };

  

  return (
    <div className={`bg-gray-950 text-white p-8 ${inter.className}`}>
      <div className="text-center mb-12">
        <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
          ✨ Build Your Custom Agent
        </Badge>
        <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4 ${outfit.className}`}>
          Create and Test Your Agent
        </h1>
        <p className={`text-gray-400 max-w-2xl mx-auto ${spaceGrotesk.className}`}>
          Fill all the inputs and get started to test your Agent in the Chat Section
        </p>
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tool Creation Form */}
        <div className="bg-gray-900 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border-2 border-gray-800 hover:border-indigo-700 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <PenTool className="text-indigo-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Create Tool</h2>
          </div>
          
          {!isGroqKeyValid && (
            <Alert className="mb-6 bg-indigo-900/20 text-indigo-400 border-indigo-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please set your Groq API key in the settings page to {provider === 'groq' ? 'create and ' : ''} use tools.
                {provider !== 'groq' && ' Make sure to select Groq as your provider.'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateTool} className="space-y-6">
            {/* Form inputs with updated styling */}
            <div>
              <label className="block text-sm font-medium text-gray-200">Tool Name</label>
              <input
                type="text"
                value={tool.name}
                onChange={(e) => setTool(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 block w-full bg-gray-900/50 border-gray-800 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            {/* Similar updates for other form inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-200">Description</label>
              <textarea
                value={tool.description}
                onChange={(e) => setTool(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">API URL</label>
              <input
                type="url"
                value={tool.apiUrl}
                onChange={(e) => setTool(prev => ({ ...prev, apiUrl: e.target.value }))}
                className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">API Key</label>
              <input
                type="password"
                value={tool.apiKey}
                onChange={(e) => setTool(prev => ({ ...prev, apiKey: e.target.value }))}
                className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-100">Parameters</h3>
              <ParameterInput onAdd={(param) => setTool(prev => ({
                ...prev,
                parameters: [...prev.parameters, param]
              }))} />

              <div className="mt-6 space-y-3">
                {tool.parameters.map((param, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-100 font-medium">{param.name}</span>
                      <span className="text-gray-400 text-sm">{param.type}{param.required ? ' (required)' : ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTool(prev => ({
                        ...prev,
                        parameters: prev.parameters.filter((_, i) => i !== index)
                      }))}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full mb-6 group flex items-center justify-center bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all transform hover:scale-[1.02] text-white py-3 px-4 rounded-lg ${
                !isGroqKeyValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isGroqKeyValid}
            >
              <PenTool size={18} />
              <span className="ml-2">Create Tool</span>
              <ArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={18} />
            </button>
          </form>
        </div>

        {/* Chat Section */}
        <div className="bg-gray-900 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border-2 border-gray-800 hover:border-indigo-700 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-indigo-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Chat</h2>
          </div>

          {!isGroqKeyValid && (
            <Alert className="mb-6 bg-indigo-900/20 text-indigo-400 border-indigo-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please set your Groq API key in the settings page to use the chat feature.
                {provider !== 'groq' && ' Make sure to select Groq as your provider.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="h-[600px] overflow-y-auto rounded-xl bg-gray-900/50 p-6 space-y-4 border border-gray-800">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-white'
                      : 'bg-gray-800/50 text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="mt-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-900/50 border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Type your message..."
                required
              />
              <button
                type="submit"
                disabled={loading || !isGroqKeyValid}
                className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white py-3 px-6 rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 transform hover:scale-[1.02]"
              >
                <Send size={18} />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="container mx-auto mt-8 bg-gray-900 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border-2 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <PenTool className="text-indigo-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Available Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div key={index} className="group bg-gray-900 rounded-xl p-6 border-2 border-gray-800 hover:border-indigo-700 transition-all duration-500">
              <h3 className="font-semibold text-gray-100 text-lg mb-3">{tool.name}</h3>
              <p className="text-gray-400 mb-4">{tool.description}</p>
              <div>
                <h4 className="font-medium text-gray-200 mb-2">Parameters:</h4>
                <ul className="space-y-2">
                  {tool.parameters.map((param, paramIndex) => (
                    <li key={paramIndex} className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
                      {param.name}
                      <span className="text-gray-500">({param.type})</span>
                      {param.required && (
                        <span className="text-xs bg-indigo-900/20 text-indigo-400 px-2 py-1 rounded-full">
                          required
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity z-0 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolForm;