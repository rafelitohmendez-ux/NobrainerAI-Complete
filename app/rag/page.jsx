'use client'
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code2, Building2, MessagesSquare, PlusCircle, ArrowLeft,  Brain, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon, AlertCircle,  Zap, Upload } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useUser } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import { Progress } from "@/components/ui/progress";
import NoBrainerWidget from '@/components/callbot';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY, process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_KEY);


const RAGInterface = () => {
  const [selectedRAG, setSelectedRAG] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const prebuiltRAGs = [
    {
      id: 1,
      name: "Documentation Assistant",
      description: "Helps users navigate through technical documentation and answers product-related queries",
      icon: BookOpen,
      demoUrl: "https://nchatbot.netlify.app/bot?assistantId=2d078504-3062-4cc6-8b58-d9f9ffaddf07",
      sourceCode: `
      <iframe
        src='https://nchatbot.netlify.app/bot?assistantId=2d078504-3062-4cc6-8b58-d9f9ffaddf07'
        width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
  title="Created Assistant"
       />
      `
    },
    {
      id: 2,
      name: "Code Helper",
      description: "Assists developers with code explanations, debugging, and best practices",
      icon: Code2,
      demoUrl: "https://nchatbot.netlify.app/bot?assistantId=18aa0976-1dd8-448d-8ea1-9baac6882c54",
      sourceCode: `
      <iframe
  src="https://nchatbot.netlify.app/bot?assistantId=18aa0976-1dd8-448d-8ea1-9baac6882c54"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
  title="Created Assistant"
></iframe>
      `
    },
    {
      id: 3,
      name: "Enterprise Knowledge Base",
      description: "Centralized knowledge management system for company policies and procedures",
      icon: Building2,
      demoUrl: "https://nchatbot.netlify.app/bot?assistantId=d6164b1a-147f-4884-9630-78bb6587abf5",
      sourceCode: `
      <iframe
  src="https://nchatbot.netlify.app/bot?assistantId=d6164b1a-147f-4884-9630-78bb6587abf5"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
  title="Created Assistant"
></iframe>
      `
    },
    {
      id: 4,
      name: "Customer Support Bot",
      description: "Handles customer inquiries and provides instant support",
      icon: MessagesSquare,
      demoUrl: "https://nchatbot.netlify.app/bot?assistantId=ba2f01a5-f3f5-4512-845c-81994275cb5c",
      sourceCode: `
      <iframe
  src="http://nchatbot.netlify.app/bot?assistantId=ba2f01a5-f3f5-4512-845c-81994275cb5c"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
  title="Created Assistant"
></iframe>
      `
    }
  ];

  const handleBack = () => {
    setSelectedRAG(null);
    setShowCreateForm(false);
  };

  const { user } = useUser();
  const [files, setFiles] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdAssistantId, setCreatedAssistantId] = useState(null);
  const [assistant, setAssistant] = useState({
    name: '',
    firstMessage: '',
    model: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 1,
      maxTokens: 525,
      messages: [
        {
          role: 'system',
          content: ''
        }
      ]
    }
  });

 

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    const checkUserCredits = async () => {
      if (!user) return;

      // Check if user exists in credits table
      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('userid', user.id)
        .single();

      if (fetchError || !data) {
        // New user - insert 20 credits
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            userid: user.id,
            credits: 20
          });

        if (!insertError) {
          setUserCredits(20);
          setIsNewUser(true);
        }
      } else {
        setUserCredits(data.credits);
      }
    };

    if (user) {
      checkUserCredits();
    }
  }, [user]);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.vapi.ai/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY}`,
        },
        body: formData,
      });
      // vapi private key

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setFiles([...files, result.id]);
        setSelectedFile(result.id);
        console.log('File uploaded successfully:', result);
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    setAssistant(prev => {
      if (section === 'model') {
        if (name === 'systemPrompt') {
          return {
            ...prev,
            model: {
              ...prev.model,
              messages: [
                {
                  ...prev.model.messages[0],
                  content: value
                }
              ]
            }
          };
        }
        return {
          ...prev,
          model: {
            ...prev.model,
            [name]: type === 'checkbox' ? checked : value
          }
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleSliderChange = (value, name) => {
    setAssistant(prev => ({
      ...prev,
      model: {
        ...prev.model,
        [name]: value[0]
      }
    }));
  };

  const createAssistant = async () => {

   

    setIsLoading(true);
    setShowErrorAlert(false);
    try {
      const assistantData = {
        name: assistant.name,
        firstMessage: assistant.firstMessage,
        model: {
          provider: assistant.model.provider,
          model: assistant.model.model,
          temperature: assistant.model.temperature,
          maxTokens: assistant.model.maxTokens,
          messages: assistant.model.messages[0].content ? [
            {
              role: 'system',
              content: assistant.model.messages[0].content
            }
          ] : undefined
        },
        transcriber: {
          provider: "deepgram"
        },
        voice: {
          provider: "azure",
          voiceId: "en-US-JennyNeural"
        }
      };

      if (selectedFile) {
        assistantData.model.knowledgeBase = {
          provider: 'canonical',
          fileIds: [selectedFile]
        };
      }

      if (selectedTool) {
        assistantData.model.toolIds = [selectedTool];
      }

      const response = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assistantData),
      });

      console.log(assistantData)

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred while creating the assistant.');
      }

    
      
      
      setCreatedAssistantId(data.id);
      setShowSuccessAlert(true);
      triggerConfetti();
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error) {
      console.error('Error creating assistant:', error);
      setErrorMessage(error.message);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const iframeCode = `
                  
<NoBrainerWidget 
apiKey="${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY}"
assistantId="${createdAssistantId}"
/>

`;

  const shopifyCode = `{% comment %}
Add this code to your theme.liquid file, just before the closing </body> tag
{% endcomment %}

<div id="ai-assistant-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('ai-assistant-container');
    var iframe = document.createElement('iframe');
    iframe.src = "https://nchatbot.netlify.app/bot/${createdAssistantId}";
    iframe.width = "100%";
    iframe.height = "600";
    iframe.frameBorder = "0";
    iframe.title = "AI Assistant";
    container.appendChild(iframe);
  });
</script>`;

  const RAGCard = ({ rag, onClick }) => (
    <motion.div 
    whileHover={{ scale: 1.02 }} 
    whileTap={{ scale: 0.98 }}
  >
    <Card 
      className="bg-gray-900 backdrop-blur-xl shadow-2xl rounded-2xl  border-2 border-gray-800 hover:border-indigo-700 cursor-pointer h-full"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Upload className="h-6 w-6 text-purple-500" />
          <CardTitle className="text-xl text-white">{rag.name}</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          {rag.description}
        </CardDescription>
      </CardHeader>
    </Card>
  </motion.div>
  );

  const RAGDetail = ({ rag }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <rag.icon className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-xl text-white">{rag.name}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="demo">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="source">Source Code</TabsTrigger>
          </TabsList>
          <TabsContent value="demo">
            <iframe
              src={rag.demoUrl}
              className="w-full h-[100vh] rounded-lg border border-gray-700"
              title={`${rag.name} Demo`}
            />
          </TabsContent>
          <TabsContent value="source">
            <pre className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-white">{rag.sourceCode}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div   className={`min-h-screen bg-gray-950 p-8 `}    >
      {!selectedRAG && !showCreateForm ? (
        <div className="space-y-6">
           <div className="text-center mb-12">
             <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
              ✨ Build Your Custom RAG
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4 `} >
                RAG Templates
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose from our pre-built templates or create your own custom RAG solution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className=" bg-gradient-to-br from-indigo-900 to-purple-950 backdrop-blur-xl shadow-2xl rounded-2xl  border-2 border-gray-800 cursor-pointer h-full"
                onClick={() => setShowCreateForm(true)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <PlusCircle className="h-6 w-6 text-white" />
                    <CardTitle className="text-xl text-white">Create Custom RAG</CardTitle>
                  </div>
                  <CardDescription className="text-gray-100">
                    Build your own custom RAG with specific requirements and configurations
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            
            {prebuiltRAGs.map(rag => (
              <RAGCard 
                key={rag.id} 
                rag={rag} 
                onClick={() => setSelectedRAG(rag)}
              />
            ))}
          </div>
        </div>
      ) : selectedRAG ? (
        <RAGDetail rag={selectedRAG} />
      ) : (
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>

          {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="bg-green-900 border-green-500 text-green-100">
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-100">Success</AlertTitle>
              <AlertDescription className="text-green-200">
                Assistant created successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {showErrorAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="bg-red-900 border-red-500 text-red-100">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-100">Error</AlertTitle>
              <AlertDescription className="text-red-200">
                {errorMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

<Card className="w-full bg-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-700/50">
            <CardTitle className="text-3xl text-white flex items-center gap-3">
              <Brain className="text-purple-400" size={32} />
              Build Your RAG
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Enter the specifics for your voice/text custom RAG
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <motion.div className="grid md:grid-cols-2 gap-8" layout>
              {/* Left Column */}
              <motion.div className="space-y-6" layout>
                <div className="space-y-3">
                  <Label htmlFor="assistantName" className="text-gray-200 text-sm font-medium">
                    Assistant Name
                  </Label>
                  <input
                    id="assistantName" 
                    name="name" 
                    value={assistant.name} 
                    onChange={handleInputChange} 
                    className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter assistant name"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="firstMessage" className="text-gray-200 text-sm font-medium">
                    First Message
                  </Label>
                  <textarea
                    id="firstMessage" 
                    name="firstMessage" 
                    value={assistant.firstMessage} 
                    onChange={handleInputChange} 
                    className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    placeholder="Enter the first message your assistant will say"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="systemPrompt" className="text-gray-200 text-sm font-medium">
                    System Prompt
                  </Label>
                  <textarea
                    id="systemPrompt" 
                    name="systemPrompt" 
                    value={assistant.model.messages[0].content} 
                    onChange={(e) => handleInputChange(e, 'model')} 
                     className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    placeholder="Define how your AI assistant should behave and respond"
                  />
                  <p className="text-sm text-gray-400">
                    Set the personality, role, and behavior guidelines for your AI assistant
                  </p>
                </div>
              </motion.div>

              {/* Right Column */}
              <motion.div className="space-y-6" layout>
                <div className="space-y-3">
                  <Label htmlFor="modelProvider" className="text-gray-200 text-sm font-medium">
                    Model Provider
                  </Label>
                  <input
                    id="modelProvider" 
                    name="provider" 
                    value={assistant.model.provider} 
                    onChange={(e) => handleInputChange(e, 'model')} 
                    className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., OpenAI, Anthropic"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="modelName" className="text-gray-200 text-sm font-medium">
                    Model Name
                  </Label>
                  <input
                    id="modelName" 
                    name="model" 
                    value={assistant.model.model} 
                    onChange={(e) => handleInputChange(e, 'model')} 
                    className="mt-2 block w-full bg-gray-900/50 border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., GPT-4, Claude"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="temperature" className="text-gray-200 text-sm font-medium flex justify-between">
                    <span>Temperature</span>
                    <span className="text-purple-400">{assistant.model.temperature}</span>
                  </Label>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[assistant.model.temperature]}
                    onValueChange={(value) => handleSliderChange(value, 'temperature')}
                    className="py-4"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="maxTokens" className="text-gray-200 text-sm font-medium flex justify-between">
                    <span>Max Tokens</span>
                    <span className="text-purple-400">{assistant.model.maxTokens}</span>
                  </Label>
                  <Slider
                    id="maxTokens"
                    min={1}
                    max={2000}
                    step={1}
                    value={[assistant.model.maxTokens]}
                    onValueChange={(value) => handleSliderChange(value, 'maxTokens')}
                    className="py-4"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="fileUpload" className="text-gray-200 text-sm font-medium">
                    Upload File
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileChange}
                    className="bg-gray-900/50  border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg file:bg-gradient-to-br from-indigo-800 to-purple-900 file:text-white file:border-0 file:px-2 h-[9vh] file:py-2 file:mr-4 file:rounded-lg file:hover:bg-blue-700 file:transition-colors"
                  />
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="w-full bg-gradient-to-br from-indigo-800 to-purple-900 text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      {uploading ? (
                        <Upload className="h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </motion.div>

                  {uploading && (
                    <Progress value={uploadProgress} className="w-full h-2" />
                  )}

                  {uploadStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-green-500/20 border border-green-500/50 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                          Your file has been uploaded successfully.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {uploadStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-red-500/20 border border-red-500/50 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          There was an error uploading your file. Please try again.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </CardContent>

          <CardFooter className="border-t border-gray-700/50 p-8">
            <Button 
              onClick={createAssistant}
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-indigo-800 to-purple-900 hover:from-purple-500 hover:to-emerald-600 text-white rounded-lg py-4 flex items-center justify-center gap-2 text-lg font-medium transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Zap className="animate-spin h-5 w-5" />
                  Creating...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Create Assistant
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

      
        {createdAssistantId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="w-full mt-8 bg-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <Tabs defaultValue="iframe" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 p-1 rounded-lg">
                    <TabsTrigger value="iframe" className="data-[state=active]:bg-green-400">
                      Demo
                    </TabsTrigger>
                    <TabsTrigger value="shopify" className="data-[state=active]:bg-green-400">
                      Source Code
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="iframe" className="mt-6">
                    <p className="mb-4 text-gray-300">Here's the iframe code for your new assistant:</p>
                    <pre className="bg-gray-900/50 p-6 rounded-lg overflow-x-auto border border-gray-700">

                  
<NoBrainerWidget 
apiKey={`${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY}`}
assistantId={`${createdAssistantId}`}
/>

                      
                    </pre>
                    
                  </TabsContent>
                  
                  <TabsContent value="shopify" className="mt-6">
                    <p className="mb-4 text-gray-300">
                      To integrate your assistant into youe Site, add this code:
                    </p>
                    <pre className="bg-gray-900/50 p-6 rounded-lg overflow-x-auto border border-gray-700">
                    <code className="text-gray-100">{iframeCode}</code>
                    </pre>
                   
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
          {/* Insert your existing RAG creation form here */}
        </div>
      )}
    </div>
  );
};

export default RAGInterface;
