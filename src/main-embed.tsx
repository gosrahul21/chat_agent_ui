import React from 'react'
import ReactDOM from 'react-dom/client'
import EmbedChat from './components/EmbedChat'
import './index.css'

// Extend Window interface for chatbot config
declare global {
  interface Window {
    CHATBOT_ID?: string;
    CHATBOT_API_URL?: string;
  }
}

// Get chatbot configuration from URL params (for iframe) or window object (for direct embed)
const urlParams = new URLSearchParams(window.location.search);
const chatbotId = urlParams.get('chatbotId') || window.CHATBOT_ID || '';
const apiUrl = urlParams.get('apiUrl') || window.CHATBOT_API_URL || 'http://localhost:8000';

if (!chatbotId) {
  console.error('EmbedChat: chatbotId is required');
} else {
  const root = document.getElementById('chatbot-root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <EmbedChat chatbotId={chatbotId} apiUrl={apiUrl} />
      </React.StrictMode>,
    )
  }
}

