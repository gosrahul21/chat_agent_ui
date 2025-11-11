import React from 'react'
import ReactDOM from 'react-dom/client'
import EmbedChat from './components/EmbedChat'
import './index.css'

// Get chatbot ID from URL or data attribute
const urlParams = new URLSearchParams(window.location.search);
const chatbotId = urlParams.get('chatbotId') || (window as any).CHATBOT_ID || '';

if (!chatbotId) {
  console.error('EmbedChat: chatbotId is required');
} else {
  const root = document.getElementById('chatbot-root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <EmbedChat chatbotId={chatbotId} />
      </React.StrictMode>,
    )
  }
}

