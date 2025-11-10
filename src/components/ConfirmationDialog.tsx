import {
  X,
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect } from "react";

export type ConfirmationVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  danger: {
    icon: <Trash2 className="w-6 h-6" />,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    border: "border-red-200",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    border: "border-yellow-200",
  },
  info: {
    icon: <Info className="w-6 h-6" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    border: "border-blue-200",
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    border: "border-green-200",
  },
};

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  icon,
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant];

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {!isLoading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div
                className={`${styles.iconBg} ${styles.iconColor} p-4 rounded-full`}
              >
                {icon || styles.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">{message}</p>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
