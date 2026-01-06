'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, X, Volume2, Send, Globe, FileText, Download, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from '@supabase/supabase-js';
import { useVapi } from '@/hooks/useVapi';
import { useParams } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY, process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_KEY);

const VoiceVisualizer = ({ isActive }) => {
  const bars = 20;
  return (
    <div className="flex items-center justify-center space-x-1 h-16">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-400"
          initial={{ height: 8 }}
          animate={isActive ? {
            height: [8, Math.random() * 32 + 8, 8],
            opacity: 1
          } : {
            height: 8,
            opacity: 0.3
          }}
          transition={{
            duration: isActive ? 0.8 : 0.3,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            delay: isActive ? i * 0.05 : 0,
          }}
        />
      ))}
    </div>
  );
};

const MessageBubble = ({ message, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
    className={`mb-4 p-3 rounded-lg ${
      message.role === 'assistant'
        ? message.isSummary 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 ml-4 shadow-lg' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600 ml-4 shadow-lg'
        : 'bg-gray-700 mr-4'
    }`}
  >
    <p className="text-sm whitespace-pre-line">{message.content}</p>
  </motion.div>
);

const LanguageSelector = ({ languages, currentLanguage, onChangeLanguage }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-transparent border-gray-600 hover:bg-gray-700 hover:border-gray-500 h-8 w-8"
      >
        <Globe className="h-4 w-4 text-gray-300" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48 bg-gray-800 border-gray-700">
      <div className="flex flex-col space-y-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant="ghost"
            className={`justify-start text-xs py-1.5 ${
              currentLanguage === lang.code 
                ? 'bg-gray-700 text-green-400' 
                : 'hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => onChangeLanguage(lang.code)}
          >
            {lang.name}
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

const SummaryDialog = ({ isOpen, onClose, summary, isLoading, onDownloadSummary }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-gray-800 text-white border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Call Summary</DialogTitle>
        <DialogDescription className="text-gray-300">
          AI-generated summary of your conversation
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-96 overflow-y-auto mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-300">Generating summary...</span>
          </div>
        ) : (
          <div className="p-4 bg-gray-700 rounded-md whitespace-pre-line">
            {summary}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          className="mr-2"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          onClick={onDownloadSummary}
          className="bg-green-500 hover:bg-green-600"
          disabled={isLoading || !summary}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const VapiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const { 
    vapi, 
    isTalking, 
    messages, 
    startTalking, 
    stopTalking, 
    isConnected, 
    sendMessage,
    currentLanguage,
    availableLanguages,
    changeLanguage,
    generateCallSummary,
    saveCallSummary,
    isSummarizing,
    summary
  } = useVapi();
  
  const messagesEndRef = useRef(null);
  const [assistantName, setAssistantName] = useState('AI Assistant');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchAssistantName = async () => {
      const params = useParams();
      const assistantId = params.assistantId;

      if (assistantId) {
        const { data, error } = await supabase
          .from('user_assistants')
          .select('name')
          .eq('vapi_assistant_id', assistantId)
          .single();

        if (!error && data) {
          setAssistantName(data.name);
        }
      }
    };

    fetchAssistantName();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && vapi) {
      setIsTyping(true);
      await sendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTyping(false);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
  };

  const handleGenerateSummary = async () => {
    if (messages.length < 2) {
      // Not enough messages to summarize
      return;
    }
    
    setSummaryDialogOpen(true);
    
    if (!summary) {
      await generateCallSummary();
    }
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    
    // Create a blob with the summary content
    const blob = new Blob([`CONVERSATION SUMMARY\n\n${summary}\n\nGenerated on ${new Date().toLocaleString()}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Save to database if connected
    saveCallSummary(summary, {
      date: new Date().toISOString(),
      language: currentLanguage,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-lg"
            >
              <Volume2 className="w-8 h-8" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="w-96 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl border-none overflow-hidden">
              <CardHeader className="border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                      {assistantName}
                    </CardTitle>
                    <LanguageSelector 
                      languages={availableLanguages}
                      currentLanguage={currentLanguage}
                      onChangeLanguage={handleLanguageChange}
                    />
                  </motion.div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleGenerateSummary}
                      disabled={messages.length < 2 || isSummarizing}
                      className="hover:bg-gray-700 transition-colors"
                      title="Generate conversation summary"
                    >
                      {isSummarizing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} index={index} />
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex space-x-2 ml-4"
                    >
                      <div className="bg-gray-700 p-2 rounded-lg">
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                              animate={{ y: ["0%", "-50%", "0%"] }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t border-gray-700 pt-4">
                <div className="w-full flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-green-500 hover:bg-green-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <VoiceVisualizer isActive={isTalking} />
                <Button
                  onClick={isTalking ? stopTalking : startTalking}
                  className={`w-full transition-all duration-300 ease-in-out ${
                    isTalking
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
                  }`}
                >
                  <motion.div
                    className="flex items-center justify-center"
                    animate={isTalking ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isTalking ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Talking
                      </>
                    )}
                  </motion.div>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <SummaryDialog 
        isOpen={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        summary={summary}
        isLoading={isSummarizing}
        onDownloadSummary={handleDownloadSummary}
      />
    </div>
  );
};

export default VapiChatbot;