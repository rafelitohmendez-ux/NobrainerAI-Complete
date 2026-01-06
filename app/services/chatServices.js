

// src/app/services/chatService.js
export const sendMessageToProvider = async (provider, model, message, apiKey, generationType = 'text') => {
    if (generationType === 'image') {
      return sendProdiaMessage(message, model, apiKey);
    }
  
    switch (provider) {
      case 'mistral':
        return sendMistralMessage(message, model, apiKey);
      case 'cohere':
        return sendCohereMessage(message, model, apiKey);
      case 'anthropic':
        return sendAnthropicMessage(message, model, apiKey);
      case 'groq':
        return sendGroqMessage(message, model, apiKey);
      case 'grok':
        return sendGrokMessage(message, model, apiKey);  
      case 'gemini':
        return sendGeminiMessage(message, model, apiKey);  
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };
  
  async function sendProdiaMessage(prompt, model, apiKey) {
    try {
      const response = await fetch('/api/prodia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          apiKey,
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
  
      return data.imageUrl;
    } catch (error) {
      console.error('Prodia API Error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
  
  async function sendGrokMessage(message, model, apiKey) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
        stream: false,
        temperature: 0.7,
      }),
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async function sendMistralMessage(message, model, apiKey) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
      }),
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async function sendCohereMessage(message, model, apiKey) {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        prompt: message,
        max_tokens: 100,
      }),
    });
  
    const data = await response.json();
    return data.generations[0].text;
  }
  
  async function sendAnthropicMessage(message, model, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
      }),
    });
  
    const data = await response.json();
    return data.content[0].text;
  }
  
  async function sendGroqMessage(message, model, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async function sendGeminiMessage(message, model, apiKey) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ 
          role: 'user', 
          parts: [{ text: message }] 
        }],
      }),
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  

  