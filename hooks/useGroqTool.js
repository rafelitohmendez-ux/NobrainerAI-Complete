import { useState, useCallback } from 'react';
import { Groq } from 'groq-sdk';
import { useAI } from '@/app/context/AIContext';


export const useGroqTool = () => {
  const [tools, setTools] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiKey: groqApiKey } = useAI();

  const createTool = useCallback((tool) => {
    setTools(prevTools => [...prevTools, tool]);
  }, []);

  const sendMessage = useCallback(async (content) => {

    if (!groqApiKey) {
      setError('Groq API key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true
      });

      const formattedTools = tools.map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: tool.parameters.reduce((acc, param) => ({
              ...acc,
              [param.name]: {
                type: param.type,
                description: param.description,
                ...(param.enum && { enum: param.enum }),
              },
            }), {}),
            required: tool.parameters
              .filter(param => param.required)
              .map(param => param.name),
          },
        },
      }));

      const newMessages = [...messages, { role: "user", content }];

      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: newMessages,
        tools: formattedTools,
        tool_choice: "auto",
        max_tokens: 4096,
      });

      const responseMessage = response.choices[0].message;
      const toolCalls = responseMessage.tool_calls;

      if (toolCalls) {
        newMessages.push(responseMessage);

        for (const toolCall of toolCalls) {
          const tool = tools.find(t => t.name === toolCall.function.name);
          if (!tool?.apiUrl) {
            console.warn(`No API URL found for tool: ${toolCall.function.name}`);
            continue;
          }

          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          try {
            console.log('Sending proxy request for tool:', {
              toolName: tool.name,
              apiUrl: tool.apiUrl,
              args: functionArgs
            });

            const proxyResponse = await fetch('/api/proxy-tool', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: tool.apiUrl,
                method: 'POST',
                headers: tool.apiKey 
                  ? { 'Authorization': `Bearer ${tool.apiKey}` }
                  : {},
                body: functionArgs
              }),
            });

            if (!proxyResponse.ok) {
              const errorText = await proxyResponse.text();
              console.error('Proxy request failed:', errorText);
              throw new Error(`Proxy request failed: ${errorText}`);
            }

            const functionResponse = await proxyResponse.json();
            console.log('Tool function response:', functionResponse);

            newMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: toolCall.function.name,
              content: JSON.stringify(functionResponse),
            });
          } catch (toolError) {
            console.error(`Detailed error calling tool ${toolCall.function.name}:`, toolError);
            newMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: toolCall.function.name,
              content: JSON.stringify({ 
                error: toolError.message,
                details: toolError.toString() 
              }),
            });
          }
        }

        const secondResponse = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: newMessages,
        });

        setMessages([...newMessages, secondResponse.choices[0].message]);
      } else {
        setMessages([...newMessages, responseMessage]);
      }
    } catch (err) {
      console.error('Overall error in sendMessage:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [tools, messages]);

  return {
    tools,
    messages,
    loading,
    error,
    createTool,
    sendMessage,
  };
};