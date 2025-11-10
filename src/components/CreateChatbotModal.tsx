import { X } from "lucide-react";
import { useState } from "react";
import DocumentUpload from "./DocumentUpload";

interface CreateChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChatbotData) => void;
}

export interface CreateChatbotData {
  name: string;
  description: string;
  systemPrompt?: string;
  files?: File[];
}

export default function CreateChatbotModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateChatbotModalProps) {
  const [formData, setFormData] = useState<CreateChatbotData>({
    name: "",
    description: "",
    systemPrompt: "You are a helpful AI assistant.",
    files: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateChatbotData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.systemPrompt && formData.systemPrompt.length > 1000) {
      newErrors.systemPrompt =
        "System prompt must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        description: "",
        systemPrompt: "You are a helpful AI assistant.",
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      systemPrompt: "You are a helpful AI assistant.",
      files: [],
    });
    setErrors({});
    onClose();
  };

  const handleFilesSelected = (files: File[]) => {
    setFormData((prev) => ({ ...prev, files }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Chatbot
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="max-h-[80vh]">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="e.g., Customer Support Bot"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`input resize-none ${
                  errors.description ? "border-red-500" : ""
                }`}
                placeholder="e.g., Helps customers with product inquiries and support issues"
                rows={3}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* System Prompt */}
            <div>
              <label
                htmlFor="systemPrompt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                System Prompt <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => handleChange("systemPrompt", e.target.value)}
                className={`input resize-none ${
                  errors.systemPrompt ? "border-red-500" : ""
                }`}
                placeholder="You are a helpful AI assistant."
                rows={4}
                maxLength={1000}
              />
              {errors.systemPrompt && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.systemPrompt}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.systemPrompt?.length || 0}/1000 characters
              </p>
            </div>

            {/* Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              <DocumentUpload onFilesSelected={handleFilesSelected} />
              <p className="text-xs text-gray-500 mt-2">
                You can also upload documents later in the chatbot settings
              </p>
            </div>
          </div>
          {/* Actions */}
        </form>
        <div className="flex justify-end space-x-3 pt-4 p-6 border-t border-gray-200">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="btn-primary">
            Create Chatbot
          </button>
        </div>
      </div>
    </div>
  );
}
