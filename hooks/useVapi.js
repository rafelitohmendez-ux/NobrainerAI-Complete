'use client'

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export const useVapi = () => {
  const [vapi, setVapi] = useState(null);
  const [isTalking, setIsTalking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assistantId = urlParams.get('assistantId');

    if (assistantId && !vapi) {
      const vapiInstance = new Vapi(process.env.VAPI_PUBLIC_KEY);
      setVapi(vapiInstance);

      vapiInstance.on("call-start", () => {
        setIsTalking(true);
        setIsConnected(true);
      });

      vapiInstance.on("call-end", () => {
        setIsTalking(false);
        setIsConnected(false);
      });

      vapiInstance.on("speech-start", () => {
        setIsTalking(true);
      });

      vapiInstance.on("speech-end", () => {
        setIsTalking(false);
      });

      vapiInstance.on("message", (message) => {
        if (message.type === "transcript") {
          setMessages(prev => [...prev, { role: "user", content: message.transcript }]);
        } else if (message.type === "message") {
          setMessages(prev => [...prev, { role: "assistant", content: message.content }]);
        }
      });
    }

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [vapi]);

  const changeLanguage = async (languageCode) => {
    if (!vapi || !isConnected) return;
    
    try {
      // Map language codes to appropriate voice IDs based on provider
      const voiceMap = {
        'en-US': 'en-US-SaraNeural',
        'es-ES': 'es-ES-ElviraNeural',
        'fr-FR': 'fr-FR-DeniseNeural',
        'de-DE': 'de-DE-KatjaNeural',
        'it-IT': 'it-IT-ElsaNeural',
        'pt-BR': 'pt-BR-FranciscaNeural',
        'ja-JP': 'ja-JP-NanamiNeural',
        'zh-CN': 'zh-CN-XiaoxiaoNeural'
      };

      // Update voice settings
      await vapi.send({
        type: "update-config",
        config: {
          voice: {
            provider: "azure", // Using Azure for its wide language support
            voiceId: voiceMap[languageCode]
          },
          // Update transcriber to support the selected language
          transcriber: {
            provider: "deepgram", // Using Deepgram for its language support
            // Nova-2 model supports multiple languages
            model: "nova-2"
          }
        }
      });
      
      // Let the user know the language has changed
      await vapi.send({
        type: "add-message",
        message: {
          role: "assistant",
          content: getLanguageChangeMessage(languageCode)
        }
      });
      
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };
  
  const getLanguageChangeMessage = (languageCode) => {
    const messages = {
      'en-US': "I've switched to English. How can I help you?",
      'es-ES': "He cambiado al español. ¿Cómo puedo ayudarte?",
      'fr-FR': "Je suis passé au français. Comment puis-je vous aider?",
      'de-DE': "Ich bin auf Deutsch umgestiegen. Wie kann ich Ihnen helfen?",
      'it-IT': "Sono passato all'italiano. Come posso aiutarti?",
      'pt-BR': "Mudei para o português. Como posso ajudá-lo?",
      'ja-JP': "日本語に切り替えました。どのようにお手伝いできますか？",
      'zh-CN': "我已切换到中文。我能帮您什么？"
    };
    return messages[languageCode] || "Language changed successfully.";
  };

  const startTalking = async () => {
    if (vapi && !isConnected) {
      const urlParams = new URLSearchParams(window.location.search);
      const assistantId = urlParams.get('assistantId');
      try {
        // Start with the current language settings
        await vapi.start(assistantId, {
          voice: {
            provider: "azure",
            voiceId: currentLanguage === 'en-US' ? 'en-US-SaraNeural' : 
              `${currentLanguage}-${currentLanguage.split('-')[1].charAt(0)}Neural`
          },
          transcriber: {
            provider: "deepgram",
            model: "nova-2"
          }
        });
      } catch (error) {
        console.error('Error starting vapi:', error);
      }
    } else if (vapi && isConnected) {
      vapi.setMuted(false);
      setIsTalking(true);
    }
  };

  const stopTalking = () => {
    if (vapi && isConnected) {
      vapi.setMuted(true);
      setIsTalking(false);
    }
  };

  const sendMessage = async (content) => {
    if (!vapi || !isConnected) {
      // If not connected, start a new call first
      const urlParams = new URLSearchParams(window.location.search);
      const assistantId = urlParams.get('assistantId');
      try {
        await vapi.start(assistantId);
      } catch (error) {
        console.error('Error starting vapi:', error);
        return;
      }
    }

    try {
      await vapi.send({
        type: "add-message",
        message: {
          role: "user",
          content: content
        }
      });
      
      // Add the user message to the local state immediately
      setMessages(prev => [...prev, { role: "user", content: content }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const generateCallSummary = async () => {
    if (messages.length === 0) {
      // No conversation to summarize
      return null;
    }

    setIsSummarizing(true);

    try {
      // Format the conversation for the Groq API
      const conversationText = messages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      // Prepare the prompt for summary generation
      const prompt = `
Please provide a concise summary of the following conversation between a user and an AI assistant. 
Focus on the main topics discussed, any questions asked, solutions provided, and decisions made.

CONVERSATION:
${conversationText}

SUMMARY:`;

      // Call the Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',  // Using LLaMA 3 8B model
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      const result = await response.json();
      
      if (result.choices && result.choices.length > 0) {
        const generatedSummary = result.choices[0].message.content.trim();
        setSummary(generatedSummary);
        
        // Also add this as a special message if the call is still active
        if (vapi && isConnected) {
          await vapi.send({
            type: "add-message",
            message: {
              role: "assistant",
              content: `📝 Call Summary:\n\n${generatedSummary}`
            }
          });
          
          // Add to the local messages state
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `📝 Call Summary:\n\n${generatedSummary}`,
            isSummary: true
          }]);
        }
        
        return generatedSummary;
      } else {
        console.error('No summary generated from Groq API', result);
        return null;
      }
    } catch (error) {
      console.error('Error generating call summary:', error);
      return null;
    } finally {
      setIsSummarizing(false);
    }
  };

  // Function to save the call summary to a database (optional implementation)
  const saveCallSummary = async (summary, callMetadata = {}) => {
    try {
      const { data, error } = await supabase
        .from('call_summaries')
        .insert([
          { 
            summary: summary,
            conversation: messages,
            metadata: callMetadata,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving call summary:', error);
      return null;
    }
  };

  return { 
    vapi, 
    isTalking, 
    isConnected,
    messages, 
    startTalking, 
    stopTalking,
    sendMessage,
    currentLanguage,
    availableLanguages,
    changeLanguage,
    generateCallSummary,
    saveCallSummary,
    isSummarizing,
    summary
  };
};