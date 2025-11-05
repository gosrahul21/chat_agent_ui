import { X, Settings as SettingsIcon, Trash2, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import type { Chatbot } from '../types';
import type { Document } from '../types/document';

interface ChatbotSettingsModalProps {
  chatbot: Chatbot;
  documents: Document[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (chatbot: Chatbot) => void;
  onDelete: () => void;
  onUploadDocuments: (files: File[]) => void;
  onDeleteDocument: (documentId: string) => void;
}

export default function ChatbotSettingsModal({
  chatbot,
  documents,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onUploadDocuments,
  onDeleteDocument,
}: ChatbotSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'documents'>('general');
  const [formData, setFormData] = useState({
    name: chatbot.name,
    description: chatbot.description,
    systemPrompt: chatbot.systemPrompt || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onUpdate({
        ...chatbot,
        ...formData,
      });
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUploadDocuments(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handleDeleteChatbot = () => {
    if (window.confirm(`Are you sure you want to delete "${chatbot.name}"? This action cannot be undone.`)) {
      onDelete();
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Chatbot Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents ({documents.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
                  rows={3}
                  maxLength={500}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  className="input resize-none"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h3>
                <button
                  onClick={handleDeleteChatbot}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Chatbot</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Upload New Documents</h3>
                <DocumentUpload onFilesSelected={setSelectedFiles} />
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleUpload}
                    className="mt-3 btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload {selectedFiles.length} File(s)</span>
                  </button>
                )}
              </div>

              {/* Existing Documents */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Uploaded Documents ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          {activeTab === 'general' && (
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

