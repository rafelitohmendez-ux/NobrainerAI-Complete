'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import Vapi from '@vapi-ai/web';

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

const VapiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [vapi, setVapi] = useState(null);
  const [assistantName, setAssistantName] = useState('AI Assistant');

const urlParams = new URLSearchParams(window.location.search);
      const assistantId = urlParams.get('assistantId');

 
  useEffect(() => {
    const initializeVapi = async () => {
      if (!vapi) {
        try {
          const vapiInstance = new Vapi('b2f456f6-29d3-40d3-8b96-f9142dc205e2');
          setVapi(vapiInstance);

          // Set up event listeners
          vapiInstance.on("call-start", () => {
            console.log('Call started');
            setIsTalking(true);
            setIsConnected(true);
          });

          vapiInstance.on("call-end", () => {
            console.log('Call ended');
            setIsTalking(false);
            setIsConnected(false);
          });

          vapiInstance.on("speech-start", () => {
            console.log('Speech started');
            setIsTalking(true);
          });

          vapiInstance.on("speech-end", () => {
            console.log('Speech ended');
            setIsTalking(false);
          });

          vapiInstance.on("error", (error) => {
            console.error('Vapi error:', error);
            setIsTalking(false);
            setIsConnected(false);
          });

        } catch (error) {
          console.error('Error initializing Vapi:', error);
        }
      }
    };

    initializeVapi();

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, []);

  const startTalking = async () => {
    if (!vapi) {
      console.error('Vapi not initialized');
      return;
    }

    if (!assistantId) {
      console.error('No assistant ID provided');
      return;
    }

    try {
      console.log('Starting Vapi with assistant:', assistantId);
      
      // Start the call with minimal configuration
      await vapi.start(assistantId, {
        voice: {
          provider: "azure",
          voiceId: "en-US-JennyNeural"
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2"
        }
      });
      
      console.log('Vapi started successfully');
    } catch (error) {
      console.error('Error starting Vapi:', error);
      alert('Failed to start voice assistant. Please check console for details.');
    }
  };

  const stopTalking = () => {
    if (vapi && isConnected) {
      try {
        vapi.stop();
        console.log('Vapi stopped');
      } catch (error) {
        console.error('Error stopping Vapi:', error);
      }
    }
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
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                    {assistantName}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-6">
                <VoiceVisualizer isActive={isTalking} />
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-4">
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
                        Stop Talking
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
    </div>
  );
};

export default VapiChatbot;