import { useState, useEffect } from 'react';
import { Plus, Search, Bot as BotIcon } from 'lucide-react';
import ChatbotCard from './components/ChatbotCard';
import ChatInterface from './components/ChatInterface';
import CreateChatbotModal, { type CreateChatbotData } from './components/CreateChatbotModal';
import ChatbotSettingsModal from './components/ChatbotSettingsModal';
import { mockAPI } from './data/mockData';
import type { Chatbot, Message } from './types';
import type { Document } from './types/document';

function App() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Load chatbots on mount
  useEffect(() => {
    loadChatbots();
  }, []);

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
        setSelectedChatbotId(bots[0].id);
      }
    } catch (error) {
      console.error('Failed to load chatbots:', error);
    }
  };

  const loadChatHistory = async (chatbotId: string) => {
    try {
      const history = await mockAPI.getChatHistory(chatbotId);
      setMessages(history.history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadDocuments = async (chatbotId: string) => {
    try {
      const docs = await mockAPI.getDocuments(chatbotId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChatbotId) return;

    setIsLoading(true);
    try {
      const assistantMessage = await mockAPI.sendMessage(selectedChatbotId, message);
      await loadChatHistory(selectedChatbotId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedChatbotId) return;

    if (window.confirm('Are you sure you want to clear the chat history?')) {
      try {
        await mockAPI.clearHistory(selectedChatbotId);
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  };

  const handleCreateChatbot = async (data: CreateChatbotData) => {
    try {
      const newChatbot = await mockAPI.createChatbot(data);
      setChatbots([...chatbots, newChatbot]);
      setSelectedChatbotId(newChatbot.id);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create chatbot:', error);
      alert('Failed to create chatbot. Please try again.');
    }
  };

  const handleUpdateChatbot = async (chatbot: Chatbot) => {
    try {
      const updated = await mockAPI.updateChatbot(chatbot);
      setChatbots(chatbots.map(b => b.id === updated.id ? updated : b));
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to update chatbot:', error);
      alert('Failed to update chatbot. Please try again.');
    }
  };

  const handleDeleteChatbot = async () => {
    if (!selectedChatbotId) return;

    try {
      await mockAPI.deleteChatbot(selectedChatbotId);
      setChatbots(chatbots.filter(b => b.id !== selectedChatbotId));
      setSelectedChatbotId(chatbots.length > 1 ? chatbots[0].id : null);
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete chatbot:', error);
      alert('Failed to delete chatbot. Please try again.');
    }
  };

  const handleUploadDocuments = async (files: File[]) => {
    if (!selectedChatbotId) return;

    try {
      const newDocs = await mockAPI.uploadDocuments(selectedChatbotId, files);
      setDocuments([...documents, ...newDocs]);
    } catch (error) {
      console.error('Failed to upload documents:', error);
      alert('Failed to upload documents. Please try again.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!selectedChatbotId) return;

    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await mockAPI.deleteDocument(selectedChatbotId, documentId);
        setDocuments(documents.filter(d => d.id !== documentId));
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const selectedChatbot = chatbots.find((bot) => bot.id === selectedChatbotId);

  const filteredChatbots = chatbots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <p className="text-sm text-gray-500">AI-Powered Customer Support</p>
              </div>
            </div>
            <button className="btn-primary flex items-center space-x-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>New Chatbot</span>
            </button>
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
              <div className="text-center py-8">
                <BotIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No chatbots found</p>
              </div>
            ) : (
              filteredChatbots.map((chatbot) => (
                <ChatbotCard
                  key={chatbot.id}
                  chatbot={chatbot}
                  onSelect={setSelectedChatbotId}
                  isSelected={chatbot.id === selectedChatbotId}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          {selectedChatbot ? (
            <ChatInterface
              chatbotId={selectedChatbot.id}
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Chatbot Selected</h2>
                <p className="text-gray-500">Select a chatbot from the sidebar to start chatting</p>
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
    </div>
  );
}

export default App;
