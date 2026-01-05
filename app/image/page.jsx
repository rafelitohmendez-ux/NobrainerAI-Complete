'use client'

import React, { useState } from 'react';
import { Wand2, ImageIcon, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

const styles = [
  "comic-book",
  "digital-art",
  "fantasy-art",
  "line-art",
  "anime",
  "watercolor",
  "oil-painting",
  "3d-render",
  "pixel-art",
  "surrealism"
];

const models = [
  { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1 Schnell" },
  { id: "stability-ai/stable-diffusion", name: "Stable Diffusion" },
  { id: "openai/dall-e", name: "DALL-E" },
  { id: "midjourney", name: "MidJourney" }
];

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [batchSize, setBatchSize] = useState(1); // Default batch size is 1
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]); // Array to store multiple images
  const [error, setError] = useState(null);

  const TOGETHER_API_KEY = 'dfb76af84e531818294f18274c3b122744972c02e8445ed0aceb27f07d389347'; // Replace with your actual API key

  const handleGenerate = async () => {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt: Must provide a non-empty string');
    }
    setIsGenerating(true);
    setError(null);
    try {
        const data = {
            model: selectedModel,
            prompt: `${prompt}. Style: ${selectedStyle}`,
            steps: 10,
            n: batchSize // Use batch size for generating multiple images
        };

        const response = await axios.post('https://api.together.xyz/v1/images/generations', data, {
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
            throw new Error('No image data received');
        }

        // Set the array of generated image URLs
        setGeneratedImages(response.data.data.map((item) => item.url));

    } catch (error) {
        console.error('Image generation error:', {
            message: error.message,
            stack: error.stack,
            prompt: prompt
        });
        setError(error.message);
        if (error.message.includes('credentials')) {
            throw new Error('Authentication failed: Please check your TOGETHER_API_KEY');
        }
        throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            ✨ AI Image Generator
          </Badge>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
            Create stunning AI-generated artwork
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into beautiful images using state-of-the-art AI models
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Image Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure your image generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt
                </label>
                <Input
                  placeholder="Describe your image..."
                  className="bg-gray-800 border-gray-700 text-white"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Style
                </label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {styles.map((style) => (
                      <SelectItem key={style} value={style} className="text-white">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white">
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch Size (Number of Images)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Number of images to generate"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Generated Images</CardTitle>
              <CardDescription className="text-gray-400">
                Your AI-generated artwork will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.length > 0 ? (
                  generatedImages.map((imageUrl, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={imageUrl}
                        alt={`Generated artwork ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  // Show 4 placeholder icons when no images are generated
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-600" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-4">Features included:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'High-Quality Output',
              'Multiple Models',
              'Custom Styles',
              'Fast Generation',
              'Batch Generation'
            ].map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}