'use client'

import React from 'react';
import { Save, Settings2 } from 'lucide-react';
import { Space_Grotesk, Outfit } from 'next/font/google';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AI_PROVIDERS, PRODIA_MODELS } from '../../app/constants/aiProviders';
import { useAI } from '../../app/context/AIContext';
import { useEffect } from 'react';

const outfit = Outfit({ subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

const SettingsPage = () => {
  const {
    provider,
    model,
    apiKey,
    setApiKey,
    handleProviderChange,
    setModel,
    generationType,
    setGenerationType
  } = useAI();

  useEffect(() => {
    if (generationType === 'image') {
      setModel(PRODIA_MODELS[0]);
    } else {
      setModel(AI_PROVIDERS[provider].models[0]);
    }
  }, [generationType, provider]);

  const getCurrentProviderName = () => {
    if (generationType === 'image') {
      return 'Prodia';
    }
    return AI_PROVIDERS[provider]?.name || 'Unknown Provider';
  };

  const getAvailableModels = () => {
    if (generationType === 'image') {
      return PRODIA_MODELS;
    }
    return AI_PROVIDERS[provider]?.models || [];
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            <Settings2 className="w-4 h-4 mr-2" />
            Configure Your AI
          </Badge>
          <h1 className={`text-4xl font-bold mb-4 ${outfit.className}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
              AI Settings
            </span>
          </h1>
          <p className={`text-gray-400 max-w-2xl mx-auto ${spaceGrotesk.className}`}>
            Customize your AI experience by configuring your provider and model preferences
          </p>
        </div>

        <Card className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-indigo-700 hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Provider Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-300">Generation Type</label>
              <Select 
                value={generationType} 
                onValueChange={(value) => {
                  setGenerationType(value);
                  if (value === 'image') {
                    setModel(PRODIA_MODELS[0]);
                  } else {
                    handleProviderChange('mistral');
                  }
                }}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select generation type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="text">Text Generation</SelectItem>
                  <SelectItem value="image">Image Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {generationType === 'text' && (
              <div>
                <label className="block mb-2 font-medium text-gray-300">AI Provider</label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(AI_PROVIDERS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-gray-300">
                {generationType === 'image' ? 'Prodia Model' : 'AI Model'}
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {getAvailableModels().map((modelName) => (
                    <SelectItem key={modelName} value={modelName}>{modelName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-300">API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${getCurrentProviderName()} API key`}
                className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-400"
              />
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all transform hover:scale-[1.02] group flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Current Configuration:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge 
              variant="outline" 
              className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
            >
              {getCurrentProviderName()}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
            >
              {model}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
            >
              {generationType.charAt(0).toUpperCase() + generationType.slice(1)} Generation
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;