import axios from 'axios';
import type { Chatbot, ChatHistory, ChatResponse } from '../types';

// Chat Agent API (Node.js backend)
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

const chatbotAPI = axios.create({
  baseURL: CHATBOT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
chatbotAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
chatbotAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const chatbotService = {
  /**
   * Get all chatbots for the authenticated user
   */
  async getAllChatbots(): Promise<Chatbot[]> {
    const response = await chatbotAPI.get<APIResponse<Chatbot[]>>('/api/chatbots/all');
    return response.data.data || [];
  },

  /**
   * Get a specific chatbot by ID
   */
  async getChatbot(chatbotId: string): Promise<Chatbot | null> {
    try {
      const response = await chatbotAPI.get<APIResponse<Chatbot>>(`/api/chatbots/${chatbotId}`);
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new chatbot
   */
  async createChatbot(data: {
    name: string;
    description: string;
    systemPrompt?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Chatbot> {
    const response = await chatbotAPI.post<APIResponse<Chatbot>>('/api/chatbots', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create chatbot');
    }
    return response.data.data;
  },

  /**
   * Update an existing chatbot
   */
  async updateChatbot(chatbotId: string, data: {
    name?: string;
    description?: string;
    systemPrompt?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Chatbot> {
    const response = await chatbotAPI.put<APIResponse<Chatbot>>(`/api/chatbots/${chatbotId}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update chatbot');
    }
    return response.data.data;
  },

  /**
   * Delete a chatbot
   */
  async deleteChatbot(chatbotId: string): Promise<void> {
    const response = await chatbotAPI.delete<APIResponse<void>>(`/api/chatbots/${chatbotId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete chatbot');
    }
  },

  /**
   * Send a chat message
   */
  async sendMessage(chatbotId: string, message: string, userId?: string): Promise<ChatResponse> {
    const response = await chatbotAPI.post<APIResponse<ChatResponse>>(
      `/api/chatbots/${chatbotId}/chat`,
      { message, userId }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to send message');
    }
    return response.data.data;
  },

  /**
   * Get chat history for a chatbot
   */
  async getChatHistory(chatbotId: string): Promise<ChatHistory> {
    const response = await chatbotAPI.get<APIResponse<ChatHistory>>(
      `/api/chatbots/${chatbotId}/history`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get chat history');
    }
    return response.data.data;
  },

  /**
   * Clear chat history for a chatbot
   */
  async clearChatHistory(chatbotId: string): Promise<void> {
    const response = await chatbotAPI.delete<APIResponse<void>>(
      `/api/chatbots/${chatbotId}/history`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to clear chat history');
    }
  },

  /**
   * Stream a chat message using Server-Sent Events.
   * Calls onToken for each streamed token, onDone when finished.
   */
  streamMessage(
    chatbotId: string,
    message: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): () => void {
    const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('accessToken');

    const controller = new AbortController();

    fetch(`${CHATBOT_API_URL}/api/chatbots/${chatbotId}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) onToken(data.token);
                if (data.done) onDone();
              } catch {
                // ignore malformed lines
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err);
      });

    // Return a cleanup fn to abort the stream
    return () => controller.abort();
  },
};

