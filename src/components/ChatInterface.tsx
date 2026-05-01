import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Trash2, Bot, User, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { chatbotService } from '../services/chatbotService';

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
  chatbotId,
  chatbotName,
  messages,
  onClearHistory,
  onOpenSettings,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Sync incoming messages to local display
  useEffect(() => {
    setDisplayMessages(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, streamingContent, scrollToBottom]);

  const handleSend = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isStreaming) return;
    setInputMessage('');

    // Optimistically add user message to display
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setDisplayMessages((prev) => [...prev, userMsg]);
    setStreamingContent('');
    setIsStreaming(true);

    abortStreamRef.current = chatbotService.streamMessage(
      chatbotId,
      trimmed,
      (token) => {
        setStreamingContent((prev) => prev + token);
      },
      () => {
        // Stream complete — commit assistant message
        setStreamingContent((prev) => {
          const finalContent = prev;
          setDisplayMessages((msgs) => [
            ...msgs,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: finalContent,
              timestamp: new Date(),
            } as Message,
          ]);
          return '';
        });
        setIsStreaming(false);
      },
      (err) => {
        console.error('Stream error:', err);
        setStreamingContent('');
        setIsStreaming(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
              <p className="text-sm text-gray-500">{isStreaming ? 'Typing…' : 'Online'}</p>
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
        {displayMessages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Ask me anything! I'll use my knowledge base to provide helpful answers.
            </p>
          </div>
        ) : (
          <>
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex space-x-2 max-w-[78%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:rounded-lg">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming bubble */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-[78%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                    <Bot className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 bg-white border border-gray-200 text-gray-900">
                    {streamingContent ? (
                      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 py-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            className="input flex-1 resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isStreaming}
            className="btn-primary flex items-center space-x-2 px-6"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Streaming</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
