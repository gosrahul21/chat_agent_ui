import type { Chatbot, ChatHistory, Message } from '../types';
import type { Document } from '../types/document';

// Hardcoded chatbots
export const MOCK_CHATBOTS: Chatbot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    description: 'Helps customers with product inquiries and support issues',
    systemPrompt: 'You are a helpful customer support assistant.',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Technical Documentation Bot',
    description: 'Provides technical documentation and API references',
    systemPrompt: 'You are a technical documentation expert.',
    createdAt: '2025-01-01T11:00:00Z',
    updatedAt: '2025-01-01T11:00:00Z',
  },
  {
    id: '3',
    name: 'Sales Assistant Bot',
    description: 'Assists with product recommendations and sales inquiries',
    systemPrompt: 'You are a friendly sales assistant.',
    createdAt: '2025-01-01T12:00:00Z',
    updatedAt: '2025-01-01T12:00:00Z',
  },
];

// Hardcoded chat history
export const MOCK_CHAT_HISTORY: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg-1',
      role: 'user',
      content: 'How do I reset my password?',
      timestamp: '2025-01-01T10:30:00Z',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'To reset your password, follow these steps:\n\n1. Go to the login page\n2. Click on "Forgot Password"\n3. Enter your email address\n4. Check your email for the reset link\n5. Follow the instructions in the email\n\nIf you need further assistance, please let me know!',
      timestamp: '2025-01-01T10:30:05Z',
      metadata: {
        hasContext: true,
        contextLength: 500,
      },
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'Thanks! Where can I find my account settings?',
      timestamp: '2025-01-01T10:31:00Z',
    },
    {
      id: 'msg-4',
      role: 'assistant',
      content: 'You can find your account settings by:\n\n1. Logging into your account\n2. Clicking on your profile icon in the top right\n3. Selecting "Settings" from the dropdown menu\n\nFrom there, you can update your profile, change preferences, and manage your account security.',
      timestamp: '2025-01-01T10:31:05Z',
      metadata: {
        hasContext: true,
        contextLength: 300,
      },
    },
  ],
  '2': [
    {
      id: 'msg-5',
      role: 'user',
      content: 'How do I use the REST API?',
      timestamp: '2025-01-01T11:00:00Z',
    },
    {
      id: 'msg-6',
      role: 'assistant',
      content: 'To use our REST API:\n\n1. Get your API key from the dashboard\n2. Include it in the Authorization header:\n   ```\n   Authorization: Bearer YOUR_API_KEY\n   ```\n3. Make requests to our endpoints:\n   - Base URL: https://api.example.com/v1\n   - Example: GET /chatbots\n\n4. Handle responses in JSON format\n\nCheck our full documentation for detailed examples!',
      timestamp: '2025-01-01T11:00:10Z',
      metadata: {
        hasContext: true,
        contextLength: 800,
      },
    },
  ],
  '3': [],
};

// Hardcoded documents
export const MOCK_DOCUMENTS: Record<string, Document[]> = {
  '1': [
    {
      id: 'doc-1',
      chatbotId: '1',
      filename: 'user_manual.pdf',
      fileSize: 1024000,
      fileType: 'pdf',
      uploadedAt: '2025-01-01T10:00:00Z',
    },
    {
      id: 'doc-2',
      chatbotId: '1',
      filename: 'faq.txt',
      fileSize: 5120,
      fileType: 'txt',
      uploadedAt: '2025-01-01T10:05:00Z',
    },
  ],
  '2': [
    {
      id: 'doc-3',
      chatbotId: '2',
      filename: 'api_documentation.md',
      fileSize: 102400,
      fileType: 'md',
      uploadedAt: '2025-01-01T11:00:00Z',
    },
  ],
  '3': [],
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockAPI = {
  getChatbots: async (): Promise<Chatbot[]> => {
    await delay(300);
    return MOCK_CHATBOTS;
  },

  getChatbot: async (id: string): Promise<Chatbot | null> => {
    await delay(200);
    return MOCK_CHATBOTS.find((bot) => bot.id === id) || null;
  },

  getChatHistory: async (chatbotId: string): Promise<ChatHistory> => {
    await delay(300);
    return {
      chatbotId,
      history: MOCK_CHAT_HISTORY[chatbotId] || [],
      totalMessages: (MOCK_CHAT_HISTORY[chatbotId] || []).length,
    };
  },

  sendMessage: async (chatbotId: string, message: string): Promise<Message> => {
    await delay(1000); // Simulate thinking time
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Add user message to history
    if (!MOCK_CHAT_HISTORY[chatbotId]) {
      MOCK_CHAT_HISTORY[chatbotId] = [];
    }
    MOCK_CHAT_HISTORY[chatbotId].push(userMessage);

    // Generate mock response
    const responses = [
      'I understand your question. Let me help you with that. Based on our documentation...',
      'Great question! Here\'s what I found in our knowledge base...',
      'I can help you with that. According to our records...',
      'Thank you for asking! Here\'s the information you need...',
    ];

    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: `${responses[Math.floor(Math.random() * responses.length)]}\n\n${message}\n\nIs there anything else you'd like to know?`,
      timestamp: new Date().toISOString(),
      metadata: {
        hasContext: true,
        contextLength: Math.floor(Math.random() * 1000) + 200,
      },
    };

    MOCK_CHAT_HISTORY[chatbotId].push(assistantMessage);

    return assistantMessage;
  },

  clearHistory: async (chatbotId: string): Promise<void> => {
    await delay(200);
    MOCK_CHAT_HISTORY[chatbotId] = [];
  },

  createChatbot: async (data: { name: string; description: string; systemPrompt?: string; files?: File[] }): Promise<Chatbot> => {
    await delay(500);
    
    const newChatbot: Chatbot = {
      id: `${MOCK_CHATBOTS.length + 1}`,
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt || 'You are a helpful AI assistant.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_CHATBOTS.push(newChatbot);
    MOCK_CHAT_HISTORY[newChatbot.id] = [];
    MOCK_DOCUMENTS[newChatbot.id] = [];

    // Handle file uploads
    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
        const doc: Document = {
          id: `doc-${Date.now()}-${Math.random()}`,
          chatbotId: newChatbot.id,
          filename: file.name,
          fileSize: file.size,
          fileType: file.name.split('.').pop() || 'unknown',
          uploadedAt: new Date().toISOString(),
        };
        MOCK_DOCUMENTS[newChatbot.id].push(doc);
      }
    }

    return newChatbot;
  },

  // Document operations
  getDocuments: async (chatbotId: string): Promise<Document[]> => {
    await delay(300);
    return MOCK_DOCUMENTS[chatbotId] || [];
  },

  uploadDocuments: async (chatbotId: string, files: File[]): Promise<Document[]> => {
    await delay(800);
    
    const newDocuments: Document[] = [];
    for (const file of files) {
      const doc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        chatbotId,
        filename: file.name,
        fileSize: file.size,
        fileType: file.name.split('.').pop() || 'unknown',
        uploadedAt: new Date().toISOString(),
      };
      newDocuments.push(doc);
    }

    if (!MOCK_DOCUMENTS[chatbotId]) {
      MOCK_DOCUMENTS[chatbotId] = [];
    }
    MOCK_DOCUMENTS[chatbotId].push(...newDocuments);

    return newDocuments;
  },

  deleteDocument: async (chatbotId: string, documentId: string): Promise<void> => {
    await delay(300);
    if (MOCK_DOCUMENTS[chatbotId]) {
      MOCK_DOCUMENTS[chatbotId] = MOCK_DOCUMENTS[chatbotId].filter(doc => doc.id !== documentId);
    }
  },

  updateChatbot: async (chatbot: Chatbot): Promise<Chatbot> => {
    await delay(400);
    const index = MOCK_CHATBOTS.findIndex(b => b.id === chatbot.id);
    if (index !== -1) {
      MOCK_CHATBOTS[index] = { ...chatbot, updatedAt: new Date().toISOString() };
      return MOCK_CHATBOTS[index];
    }
    throw new Error('Chatbot not found');
  },

  deleteChatbot: async (chatbotId: string): Promise<void> => {
    await delay(300);
    const index = MOCK_CHATBOTS.findIndex(b => b.id === chatbotId);
    if (index !== -1) {
      MOCK_CHATBOTS.splice(index, 1);
      delete MOCK_CHAT_HISTORY[chatbotId];
      delete MOCK_DOCUMENTS[chatbotId];
    }
  },
};

