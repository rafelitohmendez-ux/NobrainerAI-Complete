'use client'

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Send, Image as ImageIcon, AlertCircle } from 'lucide-react';

const VisionChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('Image size must be less than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
      setMessages(prev => [...prev, {
        role: 'user',
        type: 'image',
        content: reader.result
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !imageUrl) return;

    try {
      setIsLoading(true);
      setError('');

      // Prepare the message content
      const messageContent = [];
      
      if (input.trim()) {
        messageContent.push({
          type: "text",
          text: input.trim()
        });
      }

      if (imageUrl) {
        messageContent.push({
          type: "image_url",
          image_url: {
            url: imageUrl
          }
        });
      }

      const newMessage = {
        role: 'user',
        type: 'text',
        content: input
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');

      // Make the API call to Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: messageContent
          }],
          model: "llama-3.2-90b-vision-preview",
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add the assistant's response to the messages
      const assistantResponse = {
        role: 'assistant',
        type: 'text',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantResponse]);
      setImageUrl(''); // Clear the image after sending
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to send message. Please try again. ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            ✨ Vision AI Chat
          </Badge>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
            Chat with your images
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload an image and start a conversation about it with our advanced vision AI.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-900 border-gray-800 mb-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Chat Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={chatContainerRef}
              className="space-y-4 mb-4 h-[400px] overflow-y-auto p-4 rounded-lg bg-gray-950"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-indigo-900/30 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    {message.type === 'image' ? (
                      <img 
                        src={message.content} 
                        alt="Uploaded content"
                        className="max-w-full rounded-lg"
                      />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-800 hover:bg-gray-700"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border-gray-700 focus:border-indigo-600"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !imageUrl)}
                className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisionChatPage;