'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, RotateCcw, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * AI Chatbot Component
 * Floating chat interface for natural language queries
 */
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! 👋 I can help you query your construction data. Click a suggestion below or ask me anything!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch smart suggestions when chat opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggestions');
      const result = await response.json();
      
      if (result.ok) {
        setSuggestions(result.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (query) => {
    setInput(query);
    setShowSuggestions(false); // Hide suggestions after clicking
    // Auto-send the query
    setTimeout(() => {
      handleSendMessage(query);
    }, 100);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! 👋 I can help you query your construction data. Click a suggestion below or ask me anything!',
        timestamp: new Date().toISOString()
      }
    ]);
    setInput('');
    setShowSuggestions(true);
    fetchSuggestions(); // Refresh suggestions
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    await handleSendMessage(userMessage);
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage || loading) return;

    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const result = await response.json();

      if (result.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.data.message,
          data: result.data.data,
          timestamp: result.data.timestamp
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ ' + (result.error || 'Sorry, I encountered an error processing your request.'),
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Network error. Please check your connection and try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-sm font-semibold mt-3 mb-1 text-gray-800">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-base font-bold mt-4 mb-2 text-gray-900">{line.replace('## ', '')}</h3>;
        }
        
        // Bold text
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(line)) {
          const parts = line.split(boldRegex);
          return (
            <p key={i} className="text-sm text-gray-700 mb-1">
              {parts.map((part, j) => 
                j % 2 === 0 ? part : <strong key={j} className="font-semibold text-gray-900">{part}</strong>
              )}
            </p>
          );
        }
        
        // Bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <li key={i} className="text-sm text-gray-700 ml-4 mb-1">{line.substring(2)}</li>;
        }
        
        // Italic text (for "...and N more")
        if (line.startsWith('_') && line.endsWith('_')) {
          return <p key={i} className="text-xs text-gray-500 italic mt-2">{line.slice(1, -1)}</p>;
        }
        
        // Regular text
        if (line.trim()) {
          return <p key={i} className="text-sm text-gray-700 mb-1">{line}</p>;
        }
        
        return <br key={i} />;
      });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full h-full md:w-96 md:h-[600px] md:max-h-[80vh] bg-white md:rounded-lg shadow-2xl flex flex-col z-50 border-t md:border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 md:px-4 py-3 md:rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              <h3 className="font-semibold text-sm md:text-base">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleReset}
                className="hover:bg-white/20 rounded p-1 md:p-1.5 transition-colors group"
                aria-label="Reset chat"
                title="Reset chat"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="hover:bg-white/20 rounded p-1 md:p-1.5 transition-colors"
                aria-label="Toggle suggestions"
                title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1 md:p-1.5 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">
                      {formatMessage(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Smart Suggestions - Show when toggled on and has suggestions */}
            {showSuggestions && !loading && suggestions.length > 0 && (
              <div className="space-y-3 mt-4 pb-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Quick Questions
                  </p>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Hide
                  </button>
                </div>
                {suggestions.map((category, catIdx) => (
                  <div key={catIdx} className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 px-1 flex items-center gap-1">
                      <span>{category.icon}</span>
                      <span>{category.category}</span>
                    </p>
                    <div className="space-y-1">
                      {category.prompts.map((prompt, promptIdx) => (
                        <button
                          key={promptIdx}
                          onClick={() => handleSuggestionClick(prompt.query)}
                          className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-xs text-gray-700 hover:text-blue-700 shadow-sm"
                        >
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show Suggestions Button - when hidden */}
            {!showSuggestions && !loading && suggestions.length > 0 && (
              <div className="flex justify-center py-2">
                <button
                  onClick={() => setShowSuggestions(true)}
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Show Quick Questions
                </button>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Analyzing your data...</span>
                </div>
              </div>
            )}

            {loadingSuggestions && (
              <div className="flex justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your projects..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
