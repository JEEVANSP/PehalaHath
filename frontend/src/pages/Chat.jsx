import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getAIResponse } from '../services/aiService';
import { useAuth } from '../context/AuthProvider';
import { useThemeStore } from '../store/theme';
import toast from 'react-hot-toast';

export const Chat = () => {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();
  
  // Load chat history from localStorage on component mount
  // Convert stored timestamps back to Date objects
  const initialMessages = JSON.parse(localStorage.getItem('chatHistory')) || [{
    type: 'bot',
    content: 'Hello! I\'m your emergency assistance AI. I can help you with:\n\n• Emergency guidance and procedures\n• Finding nearby emergency services\n• First aid advice\n• Emergency contact numbers\n\nHow can I assist you today?',
    timestamp: new Date()
  }];
  
  // Convert timestamps to Date objects
  const messagesWithDates = initialMessages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  }));
  
  const [messages, setMessages] = useState(messagesWithDates);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the entire conversation history for context
      const conversationHistory = messages.map(msg => `${msg.type}: ${msg.content}`).join('\n');
      const response = await getAIResponse(input, conversationHistory);
      
      if (!response) {
        throw new Error('No response received');
      }

      const botResponse = {
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage = {
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add clear chat history function
  const clearChatHistory = () => {
    const initialMessage = [{
      type: 'bot',
      content: 'Hello! I\'m your emergency assistance AI. I can help you with:\n\n• Emergency guidance and procedures\n• Finding nearby emergency services\n• First aid advice\n• Emergency contact numbers\n\nHow can I assist you today?',
      timestamp: new Date()
    }];
    setMessages(initialMessage);
    localStorage.setItem('chatHistory', JSON.stringify(initialMessage));
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Chat Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} p-2 rounded-lg`}>
              <Bot className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Emergency Assistant</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>24/7 AI-powered emergency support</p>
            </div>
          </div>
          <button
            onClick={clearChatHistory}
            className={`px-3 py-1 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} p-1 rounded-full`}>
                    <Bot className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                )}
                <div>
                  <div>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <Bot className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-gray-900'}`} />
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Loader2 className={`h-5 w-5 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-gray-900'}`} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading || !input.trim() ? 'bg-blue-400 cursor-not-allowed' : ''
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};