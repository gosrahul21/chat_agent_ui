import type { Document } from '../types/document';

const CHATBOT_API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const documentService = {
  /**
   * Get all documents for a chatbot
   */
  async getDocuments(chatbotId: string): Promise<Document[]> {
    const res = await fetch(`${CHATBOT_API_URL}/api/chatbots/${chatbotId}/documents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const body = await res.json();
    const docs = body.data || [];
    return docs.map((doc: any) => ({
      id: doc._id || doc.filename,
      chatbotId,
      filename: doc.originalname || doc.filename,
      fileSize: doc.size || 0,
      fileType: doc.mimetype || '',
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
    }));
  },

  /**
   * Upload a single document for a chatbot
   */
  async uploadDocument(chatbotId: string, file: File): Promise<Document> {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('document', file);

    const res = await fetch(`${CHATBOT_API_URL}/api/chatbots/${chatbotId}/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Upload failed');

    const doc = body.data;
    return {
      id: doc.id || doc.filename || Math.random().toString(36).substring(7),
      chatbotId,
      filename: doc.filename || file.name,
      fileSize: doc.fileSize || file.size,
      fileType: doc.fileType || file.type,
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
    };
  },

  /**
   * Upload multiple documents sequentially
   */
  async uploadDocuments(chatbotId: string, files: File[]): Promise<Document[]> {
    const results: Document[] = [];
    for (const file of files) {
      const doc = await this.uploadDocument(chatbotId, file);
      results.push(doc);
    }
    return results;
  },

  /**
   * Delete a document (removes from metadata only; Pinecone vectors remain)
   */
  async deleteDocument(chatbotId: string, documentId: string): Promise<void> {
    const res = await fetch(
      `${CHATBOT_API_URL}/api/chatbots/${chatbotId}/documents/${documentId}`,
      { method: 'DELETE', headers: getAuthHeaders() }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Delete failed');
    }
  },

  /**
   * Stubs kept for API compatibility — no separate train step needed
   */
  async trainChatbot(_chatbotId: string): Promise<void> {
    // Training happens automatically on upload via the RAG pipeline
  },

  async getTrainingStatus(_chatbotId: string): Promise<{ is_trained: boolean }> {
    return { is_trained: true };
  },
};
