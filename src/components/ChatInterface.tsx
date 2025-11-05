import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2, Bot, User, Settings } from 'lucide-react';
import type { Message } from '../types';

interface ChatInterfaceProps {
  chatbotId: string;
  chatbotName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  onOpenSettings?: () => void;
  isLoading?: boolean;
}

export default function ChatInterface({
  chatbotName,
  messages,
  onSendMessage,
  onClearHistory,
  onOpenSettings,
  isLoading,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{chatbotName}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
              title="Chatbot settings"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Ask me anything! I'll use my knowledge base to provide helpful answers.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex space-x-2 max-w-[70%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs ${
                          message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.metadata?.hasContext && (
                        <span
                          className={`text-xs ml-2 ${
                            message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                          }`}
                        >
                          📚 Context used
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="input flex-1 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-primary flex items-center space-x-2 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

