import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, Minimize2 } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router";
import ChatInterface from "./ChatInterface";
// import ChatInterface from "./ChatInterface";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface EmbedChatProps {
  chatbotId?: string;
  apiUrl?: string;
}

const API_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";

export default function EmbedChat({ chatbotId: propChatbotId }: EmbedChatProps = {}) {
  // Support both route params (for direct URL) and props (for embed script)
  const params = useParams();
  const chatbotId = propChatbotId || params.chatbotId;
  const apiBaseUrl =  API_BASE_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotName, setChatbotName] = useState("Chat Assistant");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we're inside an iframe
  const isInIframe = window.self !== window.top;

  useEffect(() => {
    if (chatbotId) {
      loadChatbot();
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]);

  // Listen for messages from parent (e.g., when button is clicked)
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CHATBOT_OPENED_FROM_BUTTON') {
        // Auto-open when triggered from external button
        setIsOpen(true);
      }
      
      if (event.data && event.data.type === 'CHATBOT_MINIMIZE_REQUEST') {
        // Parent requested minimize
        setIsMinimized(true);
      }
      
      if (event.data && event.data.type === 'CHATBOT_MAXIMIZE_REQUEST') {
        // Parent requested maximize
        setIsMinimized(false);
      }
    };

    if (isInIframe) {
      window.addEventListener('message', handleParentMessage);
      return () => window.removeEventListener('message', handleParentMessage);
    }
  }, [isInIframe]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to close chatbot (notify parent if in iframe)
  const handleClose = () => {
    setIsOpen(false);
    
    // If we're in an iframe, notify parent window
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'CHATBOT_CLOSE',
        chatbotId: chatbotId
      }, '*');
    }
  };

  // Function to open chatbot (notify parent if in iframe)
  const handleOpen = () => {
    setIsOpen(true);
    
    // If we're in an iframe, notify parent window
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'CHATBOT_OPEN',
        chatbotId: chatbotId
      }, '*');
    }
  };

  // Function to toggle minimize (notify parent if in iframe)
  const handleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    
    // If we're in an iframe, notify parent window
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: newMinimizedState ? 'CHATBOT_MINIMIZE' : 'CHATBOT_MAXIMIZE',
        chatbotId: chatbotId
      }, '*');
    }
  };

  const loadChatbot = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/public/chatbots/${chatbotId}`
      );
      if (response.data.success) {
        setChatbotName(response.data.data.name);
      }
    } catch (error) {
      console.error("Failed to load chatbot:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to load chatbot");
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/public/chatbots/${chatbotId}/history`
      );
      if (response.data.success) {
        const history = response.data.data.history || [];
        setMessages(
          history.map((msg: { role: "user" | "assistant"; content: string; timestamp: string }) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/public/chatbots/${chatbotId}/chat`,
        {
          message: inputValue,
          userId: "embed-user",
        }
      );

      if (response.data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.data.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(
        err.response?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error && error.includes("Domain not whitelisted")) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm shadow-lg">
        <p className="text-red-800 text-sm">
          This chatbot is not authorized for this domain.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="bottom-0 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
          style={{ pointerEvents: 'auto' }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
            isMinimized ? "w-full h-full" : "w-full h-full"
          } flex flex-col`}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className={`sticky top-0 flex items-center justify-between border-b border-gray-200 bg-blue-600 text-white ${
            isMinimized ? 'rounded-lg flex-grow p-3 ' : 'rounded-t-lg p-4'
          }`}>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">{chatbotName}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Start a conversation!</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="sticky bottom-0 p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
    // <ChatInterface chatbotId={chatbotId!} chatbotName={chatbotName} messages={[]} onSendMessage={()=>{}} onClearHistory={() => {}} onOpenSettings={() => {}} isLoading={isLoading} />
 );
}

