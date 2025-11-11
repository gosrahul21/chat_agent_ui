export interface Chatbot {
  _id: string;
  userId?: string;
  name: string;
  description: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  allowedDomains?: string[];
  isEmbeddable?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    hasContext?: boolean;
    contextLength?: number;
  };
}

export interface ChatHistory {
  chatbotId: string;
  history: Message[];
  totalMessages: number;
}

export interface ChatRequest {
  message: string;
  userId?: string;
}

export interface ChatResponse {
  response: string;
  hasContext: boolean;
  context?: string;
  timestamp: string;
}

