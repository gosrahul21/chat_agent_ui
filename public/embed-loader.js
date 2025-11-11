/**
 * Chatbot Embed Loader Script
 * 
 * Usage:
 * <script src="https://your-domain.com/embed-loader.js" 
 *         data-chatbot-id="YOUR_CHATBOT_ID"
 *         data-api-url="https://your-api.com"></script>
 */

(function() {
  // Get script tag and configuration
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:8000';
  
  if (!chatbotId) {
    console.error('Chatbot Embed: data-chatbot-id is required');
    return;
  }

  // Store configuration globally
  window.CHATBOT_ID = chatbotId;
  window.CHATBOT_API_URL = apiUrl;

  // Create container for the chatbot
  const container = document.createElement('div');
  container.id = 'chatbot-root';
  document.body.appendChild(container);

  // Load the chatbot widget CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${window.location.origin}/assets/embed.css`;
  document.head.appendChild(link);

  // Load the chatbot widget script
  const embedScript = document.createElement('script');
  embedScript.type = 'module';
  embedScript.src = `${window.location.origin}/assets/embed.js`;
  embedScript.onload = function() {
    console.log('Chatbot widget loaded successfully');
  };
  embedScript.onerror = function() {
    console.error('Failed to load chatbot widget');
  };
  document.body.appendChild(embedScript);
})();


