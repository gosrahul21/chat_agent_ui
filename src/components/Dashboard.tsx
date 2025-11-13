import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Bot as BotIcon,
  LogOut,
  User as UserIcon,
  Command,
  // MessageSquare,
  // FileText,
  Sparkles,
} from "lucide-react";
import ChatbotCard from "../components/ChatbotCard";
import ChatInterface from "../components/ChatInterface";
import CreateChatbotModal, {
  type CreateChatbotData,
} from "../components/CreateChatbotModal";
import ChatbotSettingsModal from "../components/ChatbotSettingsModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import AuthPage from "../components/AuthPage";
// import StatsCard from "./components/StatsCard";
import CommandPalette from "../components/CommandPalette";
import { ToastContainer, type ToastProps } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { mockAPI } from "../data/mockData";
import type { Chatbot, Message } from "../types";
import type { Document } from "../types/document";

function Dashboard() {
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // CMD+N or CTRL+N to create new chatbot
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load messages when chatbot is selected
  useEffect(() => {
    if (selectedChatbotId) {
      loadChatHistory(selectedChatbotId);
      loadDocuments(selectedChatbotId);
    }
  }, [selectedChatbotId]);

  const showToast = (message: string, type: ToastProps["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadChatbots = async () => {
    try {
      const bots = await mockAPI.getChatbots();
      setChatbots(bots);
      if (bots.length > 0 && !selectedChatbotId) {
        setSelectedChatbotId(bots[0]._id);
      }
    } catch (error) {
      showToast("Failed to load chatbots", "error");
      console.error("Failed to load chatbots:", error);
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
      showToast("Chatbot created successfully! 🎉", "success");
    } catch (error) {
      console.error("Failed to create chatbot:", error);
      showToast("Failed to create chatbot. Please try again.", "error");
    }
  };

  const handleUpdateChatbot = async (chatbot: Chatbot) => {
    try {
      const updated = await mockAPI.updateChatbot(chatbot);
      setChatbots(chatbots.map((b) => (b._id === updated._id ? updated : b)));
      showToast("Chatbot updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      showToast("Failed to update chatbot. Please try again.", "error");
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
          showToast("Chatbot deleted successfully", "success");
        } catch (error) {
          console.error("Failed to delete chatbot:", error);
          showToast("Failed to delete chatbot. Please try again.", "error");
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
      showToast(`${files.length} document(s) uploaded successfully!`, "success");
    } catch (error) {
      console.error("Failed to upload documents:", error);
      showToast("Failed to upload documents. Please try again.", "error");
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
          showToast("Document deleted successfully", "success");
        } catch (error) {
          console.error("Failed to delete document:", error);
          showToast("Failed to delete document. Please try again.", "error");
          setConfirmationDialog(null);
        }
      },
    });
  };

  // Calculate stats
  // const totalMessages = messages.length;
  // const totalDocuments = documents.length;

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        chatbots={chatbots}
        onSelectChatbot={setSelectedChatbotId}
        onCreateNew={() => setIsCreateModalOpen(true)}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat Agent Pro
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Customer Support Platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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

              {/* Quick Actions */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                title="Open Command Palette (⌘K)"
              >
                <Command className="w-4 h-4" />
                <span className="text-xs font-medium">⌘K</span>
              </button>

              <button
                className="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => setIsCreateModalOpen(true)}
                title="Create New Chatbot (⌘N)"
              >
                <Plus className="w-4 h-4" />
                <span>New Chatbot</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      {/* {chatbots.length > 0 && (
        <div className="max-w-screen-2xl mx-auto w-full px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              icon={BotIcon}
              label="Total Chatbots"
              value={chatbots.length}
              gradient="from-blue-500 to-blue-600"
              trend={{ value: "+2 this week", isPositive: true }}
            />
            <StatsCard
              icon={MessageSquare}
              label="Total Messages"
              value={totalMessages}
              gradient="from-purple-500 to-purple-600"
            />
            <StatsCard
              icon={FileText}
              label="Documents"
              value={totalDocuments}
              gradient="from-green-500 to-green-600"
            />
            <StatsCard
              icon={TrendingUp}
              label="Active Chats"
              value={messages.length > 0 ? "Active" : "Idle"}
              gradient="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full flex overflow-hidden gap-4 px-6 pb-6">
        {/* Sidebar */}
        <aside className="w-80 bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200/50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search chatbots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white/50 focus:bg-white"
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
        <main className="flex-1 flex flex-col bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
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
              <div className="text-center animate-in fade-in duration-500">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <BotIcon className="relative w-20 h-20 text-gray-400 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {chatbots.length === 0
                    ? "Welcome to Chat Agent Pro"
                    : "No Chatbot Selected"}
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {chatbots.length === 0
                    ? "Create your first AI chatbot and start delivering exceptional customer support with intelligent conversations"
                    : "Select a chatbot from the sidebar to start chatting"}
                </p>
                {chatbots.length === 0 && (
                  <div className="space-y-4">
                    <button
                      className="btn-primary flex items-center space-x-2 px-6 py-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Your First Chatbot</span>
                    </button>
                    <p className="text-sm text-gray-400">
                      or press{" "}
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                        ⌘N
                      </kbd>{" "}
                      to get started
                    </p>
                  </div>
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

export default Dashboard;
