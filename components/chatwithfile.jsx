// components/ChatWithFile.js
import { useState, useEffect } from 'react';
import { OpenAI, FunctionTool, OpenAIAgent, OpenAIContextAwareAgent, Settings, SimpleDirectoryReader, HuggingFaceEmbedding, VectorStoreIndex, QueryEngineTool } from 'llamaindex';

const useChatWithFile = () => {
  const [fileData, setFileData] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Set up the embedding model
    Settings.embedModel = new HuggingFaceEmbedding({
      modelType: 'BAAI/bge-small-en-v1.5',
      quantized: false,
    });
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData(`../data/${file.name}`);
    const index = await VectorStoreIndex.fromDocuments(documents);
    const retriever = await index.asRetriever();
    retriever.similarityTopK = 10;

    const agent = new OpenAIContextAwareAgent({
      contextRetriever: retriever,
    });

    setFileData(documents[0].text);

    const initialPrompt = 'Hello! I can help you explore the contents of the uploaded file. What would you like to know?';
    const initialResponse = await agent.chat({ message: initialPrompt });
    setChatHistory([{ role: 'assistant', content: initialResponse }]);
  };

  const handleUserMessage = async (message) => {
    const agent = new OpenAIContextAwareAgent({
      contextRetriever: retriever,
    });

    const response = await agent.chat({ message });
    setChatHistory((prevHistory) => [...prevHistory, { role: 'user', content: message }, { role: 'assistant', content: response }]);
  };

  return { fileData, chatHistory, handleFileUpload, handleUserMessage };
};

export default useChatWithFile;