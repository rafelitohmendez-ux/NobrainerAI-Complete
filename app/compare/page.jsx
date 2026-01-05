'use client'

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Network, 
  Send, 
  Check, 
  X, 
  RefreshCw, 
  ChevronDown, 
  Combine,
  CloudLightning 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AI_PROVIDERS } from '../constants/aiProviders';
import { sendMessageToProvider } from '../services/chatServices';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://drzaxxnujlgrxhwbxqto.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyemF4eG51amxncnhod2J4cXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3OTg5ODcsImV4cCI6MjA0ODM3NDk4N30.YoNrlmGcKfuss9WD-XgsQQNrmGjkM8aQwvFAfsI8WzY')

const ModelComparison = () => {
  const { user } = useUser();
  const [selectedModels, setSelectedModels] = useState([]);
  const [responses, setResponses] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState({});
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);

  useEffect(() => {
    const initializeUserProviders = async () => {
      if (!user) return;

      try {
        // First, check if entries already exist
        const { data: existingEntries, error: checkError } = await supabase
          .from('user_provider_keys')
          .select('provider')
          .eq('user_id', user.id);

        if (checkError) throw checkError;

        // Get providers without entries
        const providersToInit = Object.keys(AI_PROVIDERS)
          .filter(provider => 
            !existingEntries.some(entry => entry.provider === provider)
          );

        // Insert empty entries for providers without existing records
        if (providersToInit.length > 0) {
          const newEntries = providersToInit.map(provider => ({
            user_id: user.id,
            provider: provider,
            api_key: '', // Empty string initially
          }));

          const { error: insertError } = await supabase
            .from('user_provider_keys')
            .insert(newEntries);

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error initializing user providers:', error);
      }
    };

    // Fetch saved API keys
    const fetchSavedApiKeys = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_provider_keys')
          .select('provider, api_key')
          .eq('user_id', user.id)
          .not('api_key', 'eq', ''); // Only fetch non-empty keys

        if (error) throw error;

        const savedKeys = data.reduce((acc, item) => {
          acc[item.provider] = item.api_key;
          return acc;
        }, {});

        setApiKeys(savedKeys);
      } catch (error) {
        console.error('Error fetching API keys:', error);
      }
    };

    // Run both initialization and key fetching
    initializeUserProviders();
    fetchSavedApiKeys();
  }, [user]);

  // Update API key for a specific provider
  const saveApiKeyToSupabase = async (provider, apiKey) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_provider_keys')
        .update({ api_key: apiKey })
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };


  // Group models by provider
  const groupedModels = Object.entries(AI_PROVIDERS).map(([providerId, provider]) => ({
    provider: providerId,
    name: provider.name,
    models: provider.models.map(modelId => ({
      provider: providerId,
      model: modelId,
      label: modelId
    }))
  }));

  // Scroll to bottom of chat when responses update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const handleApiKeySubmit = (provider, apiKey) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }));
    saveApiKeyToSupabase(provider, apiKey);
    setShowApiKeyDialog(false);
  };

  const toggleModel = (model) => {
    const isSelected = selectedModels.some(m => 
      m.provider === model.provider && m.model === model.model
    );

    if (isSelected) {
      setSelectedModels(prev => 
        prev.filter(m => !(m.provider === model.provider && m.model === model.model))
      );
    } else {
      if (!apiKeys[model.provider]) {
        setSelectedProvider(model.provider);
        setShowApiKeyDialog(true);
      }
      setSelectedModels(prev => [...prev, model]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedModels.length) return;

    const missingKeys = selectedModels.filter(model => !apiKeys[model.provider]);
    if (missingKeys.length > 0) {
      alert(`Please set API keys for: ${missingKeys.map(m => AI_PROVIDERS[m.provider].name).join(', ')}`);
      return;
    }
// Set loading state BEFORE any async operations
    setIsComparisonLoading(true);
    const newLoading = {};
    selectedModels.forEach(model => {
      newLoading[`${model.provider}-${model.model}`] = true;
    });
    setIsLoading(newLoading);

    const requests = selectedModels.map(async (model) => {
      try {
        const response = await sendMessageToProvider(
          model.provider,
          model.model,
          inputMessage,
          apiKeys[model.provider]
        );
        return {
          key: `${model.provider}-${model.model}`,
          response
        };
      } catch (err) {
        return {
          key: `${model.provider}-${model.model}`,
          response: `Error: Failed to get response from ${AI_PROVIDERS[model.provider].name}`
        };
      }
    });

    const results = await Promise.allSettled(requests);
    const newResponsesFromPromises = {};
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        newResponsesFromPromises[result.value.key] = result.value.response;
      } else {
        const model = selectedModels[index];
        newResponsesFromPromises[`${model.provider}-${model.model}`] = 
          `Error: Failed to get response from ${AI_PROVIDERS[model.provider].name}`;
      }
      setIsLoading(prev => ({
        ...prev,
        [`${selectedModels[index].provider}-${selectedModels[index].model}`]: false
      }));
    });

    setResponses(prev => ({ ...prev, ...newResponsesFromPromises }));

    setIsComparisonLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Loading Overlay */}
      {isComparisonLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw 
              className="w-16 h-16 animate-spin text-indigo-400 mb-4" 
              strokeWidth={1.5} 
            />
            <p className="text-xl text-white">Comparing models...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1">
            <Combine className="w-6 h-6 text-indigo-400" />
            
            {/* Model Selection Dropdown */}
            <div className="relative flex-1">
              <Button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full justify-between bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 hover:border-indigo-700 transition-all duration-300"
              >
                {selectedModels.length > 0 
                  ? `${selectedModels.length} Model${selectedModels.length !== 1 ? 's' : ''} Selected` 
                  : 'Select Models'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>

              {isModelDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 max-h-64 overflow-y-auto">
                  {groupedModels.map((provider) => (
                    <div key={provider.provider} className="p-2 border-b border-gray-800 last:border-b-0">
                      <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
                        {provider.name}
                        {apiKeys[provider.provider] && (
                          <Check className="w-3 h-3 ml-2 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((model) => {
                          const isSelected = selectedModels.some(m => 
                            m.provider === model.provider && m.model === model.model
                          );
                          return (
                            <Button
                              key={`${model.provider}-${model.model}`}
                              size="sm"
                              variant={isSelected ? "default" : "ghost"}
                              onClick={() => {
                                toggleModel(model);
                                if (!apiKeys[model.provider]) {
                                  setSelectedProvider(model.provider);
                                  setShowApiKeyDialog(true);
                                }
                              }}
                              className={`text-xs ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-700 hover:to-purple-800' 
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              {model.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Models Display */}
            <div className="flex items-center gap-2 max-w-[30%]">
              {selectedModels.length > 0 && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    {selectedModels.length <= 3 ? (
                      selectedModels.map((model) => (
                        <div 
                          key={`${model.provider}-${model.model}`} 
                          className="bg-gray-900 border border-gray-800 px-2 py-1 rounded-full text-xs text-white flex items-center gap-1 mr-1 last:mr-0"
                        >
                          <span className="mr-1">{model.model}</span>
                          <X 
                            className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" 
                            onClick={() => toggleModel(model)} 
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center">
                        <div 
                          className="bg-gray-900 border border-gray-800 px-2 py-1 rounded-full text-xs text-white mr-1"
                          title={selectedModels.map(m => `${m.provider} - ${m.model}`).join('\n')}
                        >
                          {selectedModels[0].model}
                          <X 
                            className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer ml-1 inline-block" 
                            onClick={() => toggleModel(selectedModels[0])} 
                          />
                        </div>
                        <div 
                          className="bg-gray-800 px-2 py-1 rounded-full text-xs text-white"
                          title={selectedModels.slice(1).map(m => `${m.provider} - ${m.model}`).join('\n')}
                        >
                          +{selectedModels.length - 1}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* API Key Management */}
            <Button 
              variant="outline" 
              className="border-gray-800 bg-gradient-to-r from-indigo-800 to-purple-900  text-gray-300 hover:bg-gray-800 hover:border-indigo-700 transition-all duration-300"
              onClick={() => {
                const firstProviderWithoutKey = groupedModels.find(p => !apiKeys[p.provider]);
                if (firstProviderWithoutKey) {
                  setSelectedProvider(firstProviderWithoutKey.provider);
                  setShowApiKeyDialog(true);
                }
              }}
            >
              <CloudLightning className="w-4 h-4 mr-2" />
              Manage API Keys
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-4 grid ${
            selectedModels.length === 1
              ? 'grid-cols-1'
              : selectedModels.length === 2
              ? 'grid-cols-2 gap-4'
              : selectedModels.length >= 3
              ? 'grid-cols-3 gap-4'
              : ''
          }`}
        >
          {Object.keys(responses).length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 col-span-full">
              <Zap className="w-12 h-12 mb-4 text-indigo-400" />
              <p className="text-xl">Select models and enter a prompt to begin</p>
            </div>
          )}

          {Object.entries(responses).map(([key, response]) => (
            <div
              key={key}
              className={`bg-gray-900 rounded-xl p-4 border-2 border-gray-800 shadow-xl transition-all duration-500 hover:border-indigo-700 ${
                selectedModels.length === 1 ? 'col-span-full' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
                    {key.split('-')[0]} - {key.split('-')[1]}
                  </span>
                </div>
                {isLoading[key] ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <Check className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <div className="text-gray-300 whitespace-pre-wrap">
                {response}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Prompt Input */}
        <div className="p-4 bg-gray-900/50 backdrop-blur-xl border-t border-gray-800">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Enter your prompt here..."
              className="flex-1 bg-gray-900 border-gray-800 text-white focus:border-indigo-700 transition-all duration-300"
              disabled={!selectedModels.length}
            />
            <Button 
              type="submit" 
              disabled={!selectedModels.length || isComparisonLoading}
              className={`
                bg-gradient-to-r from-indigo-800 to-purple-900 
                hover:from-indigo-700 hover:to-purple-800 
                text-white transition-all duration-300
                ${isComparisonLoading ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {isComparisonLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
              Enter API Key for {selectedProvider && AI_PROVIDERS[selectedProvider].name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleApiKeySubmit(selectedProvider, formData.get('apiKey'));
          }}>
            <div className="space-y-4">
              <Input
                name="apiKey"
                type="password"
                placeholder="Enter your API key"
                className="bg-gray-900 border-gray-800 text-white focus:border-indigo-700 transition-all duration-300"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setShowApiKeyDialog(false)}
                  className="text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-700 hover:to-purple-800 text-white"
                >
                  Save Key
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelComparison;