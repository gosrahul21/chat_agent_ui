import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Bot as BotIcon,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import ChatbotCard from "./components/ChatbotCard";
import ChatInterface from "./components/ChatInterface";
import CreateChatbotModal, {
  type CreateChatbotData,
} from "./components/CreateChatbotModal";
import ChatbotSettingsModal from "./components/ChatbotSettingsModal";
import ConfirmationDialog from "./components/ConfirmationDialog";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./contexts/AuthContext";
import { mockAPI } from "./data/mockData";
import type { Chatbot, Message } from "./types";
import type { Document } from "./types/document";

function App() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "info" | "success";
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Load chatbots on mount
  useEffect(() => {
    if (!user) return;
    loadChatbots();
  }, [user]);

  // Load messages when chatbot is selected
  useEffect(() => {
    if (selectedChatbotId) {
      loadChatHistory(selectedChatbotId);
      loadDocuments(selectedChatbotId);
    }
  }, [selectedChatbotId]);

  const loadChatbots = async () => {
    try {
      const bots = await mockAPI.getChatbots();
      setChatbots(bots);
      if (bots.length > 0 && !selectedChatbotId) {
        setSelectedChatbotId(bots[0]._id);
      }
    } catch (error) {
      setTimeout(() => {
        setSelectedChatbotId(null);
        console.error("Failed to load chatbots:", error);
      }, 10000);
    }
  };

  const loadChatHistory = async (chatbotId: string) => {
    try {
      const history = await mockAPI.getChatHistory(chatbotId);
      setMessages(history.history);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const loadDocuments = async (chatbotId: string) => {
    try {
      const docs = await mockAPI.getDocuments(chatbotId);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChatbotId) return;

    setIsLoading(true);
    try {
      await mockAPI.sendMessage(selectedChatbotId, message); // TODO: handle the response from the API
      await loadChatHistory(selectedChatbotId);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedChatbotId) return;

    setConfirmationDialog({
      isOpen: true,
      title: "Clear Chat History",
      message:
        "Are you sure you want to clear all chat history? This action cannot be undone.",
      variant: "warning",
      confirmText: "Clear History",
      onConfirm: async () => {
        try {
          await mockAPI.clearHistory(selectedChatbotId);
          setMessages([]);
          setConfirmationDialog(null);
        } catch (error) {
          console.error("Failed to clear history:", error);
          setConfirmationDialog(null);
        }
      },
    });
  };

  const handleCreateChatbot = async (data: CreateChatbotData) => {
    try {
      const newChatbot = await mockAPI.createChatbot(data);
      setChatbots([...chatbots, newChatbot]);
      setSelectedChatbotId(newChatbot._id);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create chatbot:", error);
      alert("Failed to create chatbot. Please try again.");
    }
  };

  const handleUpdateChatbot = async (chatbot: Chatbot) => {
    try {
      const updated = await mockAPI.updateChatbot(chatbot);
      setChatbots(chatbots.map((b) => (b._id === updated._id ? updated : b)));
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      alert("Failed to update chatbot. Please try again.");
    }
  };

  const handleDeleteChatbot = () => {
    if (!selectedChatbotId || !selectedChatbot) return;

    setConfirmationDialog({
      isOpen: true,
      title: "Delete Chatbot",
      message: `Are you sure you want to delete "${selectedChatbot.name}"? This action cannot be undone and all associated data will be permanently deleted.`,
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await mockAPI.deleteChatbot(selectedChatbotId);
          const remainingChatbots = chatbots.filter(
            (b) => b._id !== selectedChatbotId
          );
          setChatbots(remainingChatbots);
          setSelectedChatbotId(
            remainingChatbots.length > 0 ? remainingChatbots[0]._id : null
          );
          setIsSettingsModalOpen(false);
          setConfirmationDialog(null);
        } catch (error) {
          console.error("Failed to delete chatbot:", error);
          alert("Failed to delete chatbot. Please try again.");
          setConfirmationDialog(null);
        }
      },
    });
  };

  const handleUploadDocuments = async (files: File[]) => {
    if (!selectedChatbotId) return;

    try {
      const newDocs = await mockAPI.uploadDocuments(selectedChatbotId, files);
      setDocuments([...documents, ...newDocs]);
    } catch (error) {
      console.error("Failed to upload documents:", error);
      alert("Failed to upload documents. Please try again.");
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (!selectedChatbotId) return;

    const document = documents.find((d) => d.id === documentId);
    const documentName = document?.filename || "this document";

    setConfirmationDialog({
      isOpen: true,
      title: "Delete Document",
      message: `Are you sure you want to delete "${documentName}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await mockAPI.deleteDocument(selectedChatbotId, documentId);
          setDocuments(documents.filter((d) => d.id !== documentId));
          setConfirmationDialog(null);
        } catch (error) {
          console.error("Failed to delete document:", error);
          alert("Failed to delete document. Please try again.");
          setConfirmationDialog(null);
        }
      },
    });
  };

  const selectedChatbot = chatbots.find((bot) => bot._id === selectedChatbotId);

  const filteredChatbots = chatbots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary-600 rounded-2xl mb-4 animate-pulse">
            <BotIcon className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <BotIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Agent</h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Customer Support
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.userName || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <button
                className="btn-primary flex items-center space-x-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>New Chatbot</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chatbots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Chatbot List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredChatbots.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                <BotIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {chatbots.length === 0
                    ? "No Chatbots Yet"
                    : "No Chatbots Found"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {chatbots.length === 0
                    ? "Create your first chatbot to get started"
                    : "Try adjusting your search"}
                </p>
                {chatbots.length === 0 && (
                  <button
                    className="btn-primary flex items-center space-x-2 px-6 py-3"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Chatbot</span>
                  </button>
                )}
              </div>
            ) : (
              filteredChatbots.map((chatbot) => (
                <ChatbotCard
                  key={chatbot._id}
                  chatbot={chatbot}
                  onSelect={setSelectedChatbotId}
                  isSelected={chatbot._id === selectedChatbotId}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          {selectedChatbot ? (
            <ChatInterface
              chatbotId={selectedChatbot._id}
              chatbotName={selectedChatbot.name}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearHistory={handleClearHistory}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BotIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {chatbots.length === 0
                    ? "No Chatbots Yet"
                    : "No Chatbot Selected"}
                </h2>
                <p className="text-gray-500 mb-6">
                  {chatbots.length === 0
                    ? "Create your first chatbot to get started with AI-powered conversations"
                    : "Select a chatbot from the sidebar to start chatting"}
                </p>
                {chatbots.length === 0 && (
                  <button
                    className="btn-primary flex items-center space-x-2 px-6 py-3 mx-auto"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Chatbot</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Chatbot Modal */}
      <CreateChatbotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChatbot}
      />

      {/* Settings Modal */}
      {selectedChatbot && (
        <ChatbotSettingsModal
          chatbot={selectedChatbot}
          documents={documents}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdate={handleUpdateChatbot}
          onDelete={handleDeleteChatbot}
          onUploadDocuments={handleUploadDocuments}
          onDeleteDocument={handleDeleteDocument}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog(null)}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          variant={confirmationDialog.variant}
          confirmText={confirmationDialog.confirmText}
        />
      )}
    </div>
  );
}

export default App;
