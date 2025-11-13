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
import ChatbotCard from "./components/ChatbotCard";
import ChatInterface from "./components/ChatInterface";
import CreateChatbotModal, {
  type CreateChatbotData,
} from "./components/CreateChatbotModal";
import ChatbotSettingsModal from "./components/ChatbotSettingsModal";
import ConfirmationDialog from "./components/ConfirmationDialog";
import AuthPage from "./components/AuthPage";
// import StatsCard from "./components/StatsCard";
import CommandPalette from "./components/CommandPalette";
import { ToastContainer, type ToastProps } from "./components/Toast";
import { useAuth } from "./contexts/AuthContext";
import { mockAPI } from "./data/mockData";
import type { Chatbot, Message } from "./types";
import type { Document } from "./types/document";
import { Routes, Route, BrowserRouter } from "react-router";
import Dashboard from "./components/Dashboard";
import EmbedChat from "./components/EmbedChat";

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chatbot/:chatbotId" element={ <EmbedChat /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
