'use client'
'use client'
import { createContext, useContext, useState } from 'react';
import { AI_PROVIDERS, PRODIA_MODELS } from '../constants/aiProviders';

const AIContext = createContext();

export function AIProvider({ children }) {
  const [provider, setProvider] = useState('mistral');
  const [model, setModel] = useState(AI_PROVIDERS.mistral.models[0]);
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationType, setGenerationType] = useState('text');

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    // Set the first model of the new provider as default
    setModel(AI_PROVIDERS[newProvider].models[0]);
  };

  const handleGenerationTypeChange = (newType) => {
    setGenerationType(newType);
    if (newType === 'image') {
      setModel(PRODIA_MODELS[0]);
    } else {
      setModel(AI_PROVIDERS[provider].models[0]);
    }
  };

  return (
    <AIContext.Provider
      value={{
        provider,
        setProvider,
        model,
        setModel,
        apiKey,
        setApiKey,
        isProcessing,
        setIsProcessing,
        handleProviderChange,
        generationType,
        setGenerationType: handleGenerationTypeChange,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}