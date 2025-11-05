export interface Document {
  id: string;
  chatbotId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface DocumentUploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

