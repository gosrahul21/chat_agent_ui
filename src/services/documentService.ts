import axios from 'axios';
import type { Document } from '../types/document';

// RAG Model API (Python backend)
const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:5000';

const ragAPI = axios.create({
  baseURL: RAG_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface DocumentUploadResponse {
  message: string;
  document: {
    id: string;
    chatbot_id: string;
    filename: string;
    unique_filename: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  };
}

interface DocumentListResponse {
  chatbot_id: string;
  documents: Array<{
    id: string;
    chatbot_id: string;
    filename: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  }>;
  total: number;
}

interface TrainingResponse {
  message: string;
  chatbot_id: string;
  documents_processed: number;
  total_chunks: number;
  collection_name: string;
  trained_at: string;
}

interface TrainingStatusResponse {
  chatbot_id: string;
  is_trained: boolean;
  documents_count?: number;
  chunks_count?: number;
  last_trained?: string;
  collection_name?: string;
}

export const documentService = {
  /**
   * Get all documents for a chatbot
   */
  async getDocuments(chatbotId: string): Promise<Document[]> {
    try {
      const response = await ragAPI.get<DocumentListResponse>(
        `/api/chatbots/${chatbotId}/documents`
      );
      
      // Convert Python backend format to frontend format
      return response.data.documents.map(doc => ({
        id: doc.id,
        chatbotId: doc.chatbot_id,
        filename: doc.filename,
        fileSize: doc.file_size,
        fileType: doc.file_type,
        uploadedAt: doc.uploaded_at,
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Upload a document for a chatbot
   */
  async uploadDocument(chatbotId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await ragAPI.post<DocumentUploadResponse>(
      `/api/chatbots/${chatbotId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const doc = response.data.document;
    return {
      id: doc.id,
      chatbotId: doc.chatbot_id,
      filename: doc.filename,
      fileSize: doc.file_size,
      fileType: doc.file_type,
      uploadedAt: doc.uploaded_at,
    };
  },

  /**
   * Upload multiple documents
   */
  async uploadDocuments(chatbotId: string, files: File[]): Promise<Document[]> {
    const uploadPromises = files.map(file => this.uploadDocument(chatbotId, file));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete a document
   */
  async deleteDocument(chatbotId: string, documentId: string): Promise<void> {
    await ragAPI.delete(`/api/chatbots/${chatbotId}/documents/${documentId}`);
  },

  /**
   * Train a chatbot with uploaded documents
   */
  async trainChatbot(chatbotId: string): Promise<TrainingResponse> {
    const response = await ragAPI.post<TrainingResponse>(
      `/api/chatbots/${chatbotId}/train`
    );
    return response.data;
  },

  /**
   * Get training status for a chatbot
   */
  async getTrainingStatus(chatbotId: string): Promise<TrainingStatusResponse> {
    const response = await ragAPI.get<TrainingStatusResponse>(
      `/api/chatbots/${chatbotId}/training-status`
    );
    return response.data;
  },
};

