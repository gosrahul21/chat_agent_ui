import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import DocumentUpload from "./DocumentUpload";
import ToolManagement from "./ToolManagement";
import type { Tool } from "../types/tool";

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
  tools?: Tool[];
}

export default function CreateChatbotModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateChatbotModalProps) {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [formData, setFormData] = useState<CreateChatbotData>({
    name: "",
    description: "",
    systemPrompt: "You are a helpful AI assistant.",
    files: [],
    tools: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 0, name: "Basic Info", description: "Name and description" },
    { id: 1, name: "Tools", description: "Add tool calls (optional)" },
    { id: 2, name: "Documents", description: "Upload files (optional)" },
  ];

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

  const handleNext = () => {
    if (activeStep === 0 && !validate()) {
      return;
    }
    if (activeStep < 2) {
      setActiveStep((prev) => (prev + 1) as 0 | 1 | 2);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => (prev - 1) as 0 | 1 | 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeStep !== 2) {
      handleNext();
      return;
    }

    onSubmit(formData);
    // Reset form
    setFormData({
      name: "",
      description: "",
      systemPrompt: "You are a helpful AI assistant.",
      files: [],
      tools: [],
    });
    setErrors({});
    setActiveStep(0);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      systemPrompt: "You are a helpful AI assistant.",
      files: [],
      tools: [],
    });
    setErrors({});
    setActiveStep(0);
    onClose();
  };

  const handleFilesSelected = (files: File[]) => {
    setFormData((prev) => ({ ...prev, files }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Chatbot
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {activeStep + 1} of 3: {steps[activeStep].name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      idx === activeStep
                        ? "bg-primary-600 text-white ring-4 ring-primary-100"
                        : idx < activeStep
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx < activeStep ? "✓" : idx + 1}
                  </div>
                  <div className="text-center mt-2">
                    <p
                      className={`text-xs font-medium ${
                        idx === activeStep
                          ? "text-primary-600"
                          : idx < activeStep
                          ? "text-primary-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      idx < activeStep ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Step 1: Basic Info */}
            {activeStep === 0 && (
              <div className="space-y-4">
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
              </div>
            )}

            {/* Step 2: Tools */}
            {activeStep === 1 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Add Tool Calls <span className="text-gray-400">(Optional)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable your chatbot to call external APIs and perform actions. You can also add tools later in settings.
                  </p>
                </div>
                <ToolManagement
                  tools={formData.tools || []}
                  onUpdateTools={(tools) => {
                    setFormData((prev) => ({ ...prev, tools }));
                  }}
                />
              </div>
            )}

            {/* Step 3: Documents */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Upload Documents <span className="text-gray-400">(Optional)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload documents to provide context for your chatbot. You can also upload documents later in settings.
                  </p>
                  <DocumentUpload onFilesSelected={handleFilesSelected} />
                  {formData.files && formData.files.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected files: {formData.files.length}
                      </p>
                      <div className="space-y-1">
                        {formData.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                          >
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tools:</span>
                      <span className="font-medium text-gray-900">
                        {formData.tools?.length || 0} tool(s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents:</span>
                      <span className="font-medium text-gray-900">
                        {formData.files?.length || 0} file(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
        </form>
        <div className="flex justify-between items-center pt-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary flex items-center gap-2"
            >
              {activeStep === 2 ? (
                "Create Chatbot"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
