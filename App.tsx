import React, { useState, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Message } from './types';
import { createChatSession, sendMessageWithRetry } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import DownloadIcon from './components/icons/DownloadIcon';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your friendly customer support bot. How can I assist you today?" }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  
  const ensureChatSession = useCallback(() => {
    if (!chatRef.current) {
        chatRef.current = createChatSession();
    }
    return chatRef.current;
  }, []);

  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    setError(null);
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);

    try {
      const chat = ensureChatSession();
      const response = await sendMessageWithRetry(chat, userInput);
      const modelMessage: Message = { role: 'model', content: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const systemMessage: Message = { role: 'system', content: `Error: ${errorMessage}` };
      setMessages(prev => [...prev, systemMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHistory = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(messages, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "chat-history.json";
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-100">Customer Support</h1>
        <button
          onClick={handleDownloadHistory}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Download chat history"
        >
          <DownloadIcon />
          <span>Export Chat</span>
        </button>
      </header>
      <main className="flex-grow flex flex-col overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;