
// pages/api/chat.js
import { ChatGroq } from '@langchain/groq';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { NextResponse } from 'next/server';

// Initialize Groq model
const llm = new ChatGroq({
  apiKey: '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',
  temperature: 0.7,
  // Groq supports multiple models including:
  // mixtral-8x7b-32768 and llama2-70b-4096
  modelName: 'mixtral-8x7b-32768'
});

// Initialize memory
const memory = new BufferMemory();

// Create conversation chain
const chain = new ConversationChain({
  llm: llm,
  memory: memory,
  verbose: true
});

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    // Get response from LangChain
    const response = await chain.call({
      input: message
    });

    return NextResponse.json({ 
      response: response.response 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}