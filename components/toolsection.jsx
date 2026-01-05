'use client'



import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CheckCircleIcon, AlertCircle, PlusCircle, XCircle } from 'lucide-react';
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://lwkijiwlyrnuhnckzguf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a2lqaXdseXJudWhuY2t6Z3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1ODkzODMsImV4cCI6MjA0MzE2NTM4M30.PxlHjjvTkOy-28Ir6OskzrivcagXjyakTG1j9A3MpKs')

export default function ToolCreator() {
  const [tool, setTool] = useState({
    async: false,
    messages: [{ type: 'request-start', content: '', conditions: [] }],
    type: 'function',
    function: {
      name: '',
      description: '',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    server: {
      timeoutSeconds: 20,
      url: '',
      secret: ''
    }
  });

  const { user } = useUser();

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newParam, setNewParam] = useState({ name: '', type: 'string', description: '', required: false });

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    setTool(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
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

  const handleMessageChange = (e, index) => {
    const { name, value } = e.target;
    setTool(prevTool => {
      const updatedMessages = [...prevTool.messages];
      updatedMessages[index] = { ...updatedMessages[index], [name]: value };
      return { ...prevTool, messages: updatedMessages };
    });
  };

  const handleNewParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewParam(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addParameter = () => {
    setTool(prevTool => {
      const updatedProperties = {
        ...prevTool.function.parameters.properties,
        [newParam.name]: { type: newParam.type, description: newParam.description }
      };
      const updatedRequired = newParam.required 
        ? [...prevTool.function.parameters.required, newParam.name]
        : prevTool.function.parameters.required;

      return {
        ...prevTool,
        function: {
          ...prevTool.function,
          parameters: {
            ...prevTool.function.parameters,
            properties: updatedProperties,
            required: updatedRequired
          }
        }
      };
    });
    setNewParam({ name: '', type: 'string', description: '', required: false });
  };

  const removeParameter = (paramName) => {
    setTool(prevTool => {
      const { [paramName]: _, ...restProperties } = prevTool.function.parameters.properties;
      return {
        ...prevTool,
        function: {
          ...prevTool.function,
          parameters: {
            ...prevTool.function.parameters,
            properties: restProperties,
            required: prevTool.function.parameters.required.filter(name => name !== paramName)
          }
        }
      };
    });
  };

  const createTool = async () => {
    setIsLoading(true);
    setShowErrorAlert(false);
    try {
      const response = await fetch('https://api.vapi.ai/tool', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 8dfdd899-8c45-418d-86bb-8655a4146e66', // Replace with your actual API token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tool),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred while creating the tool.');
      }
      console.log('Tool created:', data);

      const { data: assistantdata, error } = await supabase
      .from('voicebackend')
      .insert({
        userid: user.id, // You'll need to get this from Clerk
        toolid: data.id, // Assuming the API returns a file_id
      });
      
      if (error) {
          console.error('Error storing file data in Supabase:', error);
        } else {
          console.log('File data stored in Supabase:', assistantdata);
        }



      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error) {
      console.error('Error creating tool:', error);
      setErrorMessage(error.message);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-900 p-6 min-h-screen">
     <header className="text-center space-y-4 mb-4">
        <motion.h1 
          className="text-4xl font-bold text-cyan-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Connect Your Backend API in Few Minutes
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Fill all the inputs fields and add your server url etc
        </motion.p>
      </header>
    
    {showSuccessAlert && (
      <Alert className="bg-green-900 border-green-500 text-green-100">
        <CheckCircleIcon className="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Tool created successfully!
        </AlertDescription>
      </Alert>
    )}
    {showErrorAlert && (
      <Alert className="bg-red-900 border-red-500 text-red-100">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    )}
    
    <Card className="w-full bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-400">Create AI Tool</CardTitle>
        <CardDescription className="text-gray-400">Configure your new AI Voice Bot tool</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type" className="text-gray-300">Tool Type</Label>
            <Select onValueChange={(value) => handleInputChange({ target: { name: 'type', value } })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select tool type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="function">Function</SelectItem>
                <SelectItem value="dtmf">DTMF</SelectItem>
                <SelectItem value="endCall">End Call</SelectItem>
                <SelectItem value="transferCall">Transfer Call</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="output">Output</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="ghl">GHL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="async"
              checked={tool.async}
              onCheckedChange={(checked) => handleInputChange({ target: { name: 'async', type: 'checkbox', checked } })}
            />
            <Label htmlFor="async" className="text-gray-300">Asynchronous</Label>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label className="text-gray-300">Messages</Label>
            {tool.messages.map((message, index) => (
              <div key={index} className="flex flex-col space-y-1">
                <Input 
                  placeholder="Message content" 
                  name="content" 
                  value={message.content} 
                  onChange={(e) => handleMessageChange(e, index)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            ))}
          </div>

          {tool.type === 'function' && (
            <>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="functionName" className="text-gray-300">Function Name</Label>
                <Input 
                  id="functionName" 
                  name="name" 
                  value={tool.function.name} 
                  onChange={(e) => handleInputChange(e, 'function')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="functionDescription" className="text-gray-300">Function Description</Label>
                <Textarea 
                  id="functionDescription" 
                  name="description" 
                  value={tool.function.description} 
                  onChange={(e) => handleInputChange(e, 'function')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label className="text-gray-300">Parameters</Label>
                {Object.entries(tool.function.parameters.properties).map(([name, { type, description }]) => (
                  <div key={name} className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
                    <span className="text-gray-300">{name} ({type}): {description}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeParameter(name)} className="text-red-400 hover:text-red-300">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap items-end space-x-2 space-y-2">
                  <div className="flex-1">
                    <Label htmlFor="paramName" className="text-gray-300">Name</Label>
                    <Input id="paramName" name="name" value={newParam.name} onChange={handleNewParamChange} className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="paramType" className="text-gray-300">Type</Label>
                    <Select name="type" onValueChange={(value) => handleNewParamChange({ target: { name: 'type', value } })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="paramDescription" className="text-gray-300">Description</Label>
                    <Input id="paramDescription" name="description" value={newParam.description} onChange={handleNewParamChange} className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paramRequired"
                      checked={newParam.required}
                      onCheckedChange={(checked) => handleNewParamChange({ target: { name: 'required', type: 'checkbox', checked } })}
                    />
                    <Label htmlFor="paramRequired" className="text-gray-300">Required</Label>
                  </div>
                  <Button onClick={addParameter} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Parameter
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="serverUrl" className="text-gray-300">Server URL</Label>
            <Input 
              id="serverUrl" 
              name="url" 
              value={tool.server.url} 
              onChange={(e) => handleInputChange(e, 'server')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="serverSecret" className="text-gray-300">Server Secret</Label>
            <Input 
              id="serverSecret" 
              name="secret" 
              type="password"
              value={tool.server.secret} 
              onChange={(e) => handleInputChange(e, 'server')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="serverTimeout" className="text-gray-300">Server Timeout (seconds)</Label>
            <Input 
              id="serverTimeout" 
              name="timeoutSeconds" 
              type="number" 
              value={tool.server.timeoutSeconds} 
              onChange={(e) => handleInputChange(e, 'server')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={createTool} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
          {isLoading ? 'Creating...' : 'Create AI Tool'}
        </Button>
      </CardFooter>
    </Card>
  </div>
  );
}