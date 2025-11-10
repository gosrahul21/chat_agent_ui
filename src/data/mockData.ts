import type { Chatbot, ChatHistory, Message } from '../types';
import type { Document } from '../types/document';
import { chatbotService } from '../services/chatbotService';
import { documentService } from '../services/documentService';

// API functions - now using real backend services
export const mockAPI = {
  getChatbots: async (): Promise<Chatbot[]> => {
    return chatbotService.getAllChatbots();
  },

  getChatbot: async (id: string): Promise<Chatbot | null> => {
    return chatbotService.getChatbot(id);
  },

  getChatHistory: async (chatbotId: string): Promise<ChatHistory> => {
    return chatbotService.getChatHistory(chatbotId);
  },

  sendMessage: async (chatbotId: string, message: string): Promise<Message> => {
    // Send the message to the chatbot
    await chatbotService.sendMessage(chatbotId, message);
    
    // Fetch the updated history to get all messages including the response
    const history = await chatbotService.getChatHistory(chatbotId);
    
    // Return the last message (assistant's response)
    return history.history[history.history.length - 1];
  },

  clearHistory: async (chatbotId: string): Promise<void> => {
    return chatbotService.clearChatHistory(chatbotId);
  },

  createChatbot: async (data: { 
    name: string; 
    description: string; 
    systemPrompt?: string; 
    files?: File[] 
  }): Promise<Chatbot> => {
    // Create the chatbot first
    const chatbot = await chatbotService.createChatbot({
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt,
    });

    // Upload files if provided
    if (data.files && data.files.length > 0) {
      try {
        await documentService.uploadDocuments(chatbot.id, data.files);
        // Optionally train the chatbot immediately after upload
        await documentService.trainChatbot(chatbot.id);
      } catch (error) {
        console.error('Error uploading documents:', error);
        // Don't fail the chatbot creation if document upload fails
      }
    }

    return chatbot;
  },

  // Document operations
  getDocuments: async (chatbotId: string): Promise<Document[]> => {
    return documentService.getDocuments(chatbotId);
  },

  uploadDocuments: async (chatbotId: string, files: File[]): Promise<Document[]> => {
    const documents = await documentService.uploadDocuments(chatbotId, files);
    
    // Automatically train the chatbot after upload
    try {
      await documentService.trainChatbot(chatbotId);
    } catch (error) {
      console.error('Error training chatbot:', error);
      // Don't fail the upload if training fails
    }
    
    return documents;
  },

  deleteDocument: async (chatbotId: string, documentId: string): Promise<void> => {
    await documentService.deleteDocument(chatbotId, documentId);
    
    // Retrain the chatbot after deleting a document
    try {
      await documentService.trainChatbot(chatbotId);
    } catch (error) {
      console.error('Error retraining chatbot:', error);
      // Don't fail the delete if retraining fails
    }
  },

  updateChatbot: async (chatbot: Chatbot): Promise<Chatbot> => {
    return chatbotService.updateChatbot(chatbot.id, {
      name: chatbot.name,
      description: chatbot.description,
      systemPrompt: chatbot.systemPrompt,
      metadata: chatbot.metadata,
    });
  },

  deleteChatbot: async (chatbotId: string): Promise<void> => {
    return chatbotService.deleteChatbot(chatbotId);
  },
};

