/**
 * Chatbot Embed Loader Script
 * 
 * Usage:
 * <script src="https://your-domain.com/embed-loader.js" 
 *         data-chatbot-id="YOUR_CHATBOT_ID"
 *         data-api-url="https://your-api.com"></script>
 */
const apiUrl =  'http://localhost:8000';

async function generateSessionToken(embedKey) {
  try {
    const response = await fetch(`${apiUrl}/api/public/chatbots/generate-session/${embedKey}`);
    const data = await response.json();
    const sessionToken = data.data.sessionToken;
    if (!sessionToken) {
      console.error('Failed to generate session token');
      return;
    }
    return sessionToken;
  } catch (error) {
    console.error('Failed to generate session token', error);
    return null;
  }
}

(async function() {
  // Get script tag and configuration
  const script = document.currentScript;
  const embedKey = script.getAttribute('data-embed-key');

  if (!embedKey) {
    console.error('Chatbot Embed: data-embed-key is required');
    return;
  }
  const sessionToken = await generateSessionToken(embedKey);
  if (!sessionToken) {
    return;
  }

  // Determine the base URL for the widget
  const scriptSrc = script.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
  
  // For development: Use iframe approach
  // For production: This would load the built JS bundle
  
  // ==========================================
  // CREATE FLOATING CHATBOT ICON BUTTON
  // ==========================================
  const chatButton = document.createElement('button');
  chatButton.id = 'chatbot-toggle-btn';
  chatButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  chatButton.setAttribute('aria-label', 'Open chat');
  chatButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999998;
    transition: all 0.3s ease;
    color: white;
  `;
  
  // Hover effect
  chatButton.onmouseenter = function() {
    this.style.transform = 'scale(1.1)';
    this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
  };
  chatButton.onmouseleave = function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  };
  
  document.body.appendChild(chatButton);

  // ==========================================
  // CREATE IFRAME (Initially Hidden)
  // ==========================================
  const iframe = document.createElement('iframe');
  iframe.id = 'chatbot-embed-iframe';
  iframe.src = `${baseUrl}/chatbot/session/${sessionToken}`;
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40%;
    height: 75%;
    padding:0 !important;
    box-sizing: border-box;
    // border: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    z-index: 999999;
    background: transparent;
    display: none;
    border-radius: 15px;
  `;
  
  // Allow pointer events only on chatbot elements
  iframe.onload = function() {
    console.log('Chatbot widget loaded successfully');
    iframe.style.backgroundColor = 'transparent';
    iframe.setAttribute('allowtransparency', 'true');
  };
  
  iframe.onerror = function() {
    console.error('Failed to load chatbot widget. Make sure the dev server is running.');
  };
  
  document.body.appendChild(iframe);

  // ==========================================
  // BUTTON CLICK HANDLER - Toggle iframe
  // ==========================================
  let isChatOpen = false;
  
  chatButton.onclick = function() {
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
      // Show iframe
      iframe.style.display = 'block';
      iframe.style.pointerEvents = 'auto';
      chatButton.style.display = 'none';
      
      // Notify iframe that it's opened
      setTimeout(() => {
        iframe.contentWindow.postMessage({
          type: 'CHATBOT_OPENED_FROM_BUTTON'
        }, '*');
      }, 100);
    } else {
      // Hide iframe
      iframe.style.display = 'none';
      iframe.style.pointerEvents = 'none';
      chatButton.style.display = 'flex';
    }
  };

  // ==========================================
  // CLOSE FUNCTIONALITY - Listen for messages from iframe
  // ==========================================
  window.addEventListener('message', function(event) {
    // Security: Verify origin (in production, check against your domain)
    // if (event.origin !== 'http://localhost:5173') return;
    
    if (event.data && event.data.type === 'CHATBOT_CLOSE') {
      // Hide the iframe and show button
      iframe.style.display = 'none';
      iframe.style.pointerEvents = 'none';
      chatButton.style.display = 'flex';
      isChatOpen = false;
      console.log('Chatbot closed');
    }
    
    if (event.data && event.data.type === 'CHATBOT_OPEN') {
      // Show the iframe and hide button
      iframe.style.display = 'block';
      iframe.style.pointerEvents = 'auto';
      chatButton.style.display = 'none';
      isChatOpen = true;
      console.log('Chatbot opened');
    }
    
    if (event.data && event.data.type === 'CHATBOT_MINIMIZE') {
      // Minimize: reduce height to just show header
      iframe.style.height = '60px';
      iframe.style.transition = 'height 0.3s ease';
      iframe.style.bottom = '0';
      iframe.style.position = 'fixed';
      iframe.style.width = '25%';
      console.log('Chatbot minimized');
    }
    
    if (event.data && event.data.type === 'CHATBOT_MAXIMIZE') {
      // Maximize: restore to normal height
      iframe.style.height = '75%';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      iframe.style.position = 'fixed';
      iframe.style.width = '40%';
      iframe.style.transition = 'height 0.3s ease';
      console.log('Chatbot maximized');
    }
    
    if (event.data && event.data.type === 'CHATBOT_REMOVE') {
      // Completely remove the iframe and button from DOM
      iframe.remove();
      chatButton.remove();
      console.log('Chatbot removed');
    }
  });

  // ==========================================
  // PUBLIC API - Allow parent page to control chatbot
  // ==========================================
  window.ChatbotEmbed = {
    // Close the chatbot (hide iframe, show button)
    close: function() {
      iframe.style.display = 'none';
      iframe.style.pointerEvents = 'none';
      chatButton.style.display = 'flex';
      isChatOpen = false;
    },
    
    // Open the chatbot (show iframe, hide button)
    open: function() {
      iframe.style.display = 'block';
      iframe.style.pointerEvents = 'auto';
      chatButton.style.display = 'none';
      isChatOpen = true;
    },
    
    // Toggle chatbot visibility
    toggle: function() {
      if (isChatOpen) {
        this.close();
      } else {
        this.open();
      }
    },
    
    // Minimize the chatbot (reduce to header only)
    minimize: function() {
      iframe.style.height = '60px';
      iframe.style.transition = 'height 0.3s ease';
      // Notify iframe to update its internal state
      iframe.contentWindow.postMessage({
        type: 'CHATBOT_MINIMIZE_REQUEST'
      }, '*');
    },
    
    // Maximize the chatbot (restore full size)
    maximize: function() {
      iframe.style.height = '75%';
      iframe.style.transition = 'height 0.3s ease';
      // Notify iframe to update its internal state
      iframe.contentWindow.postMessage({
        type: 'CHATBOT_MAXIMIZE_REQUEST'
      }, '*');
    },
    
    // Completely remove chatbot from page
    remove: function() {
      iframe.remove();
      chatButton.remove();
    },
    
    // Hide the button (useful if you want to show/hide the trigger)
    hideButton: function() {
      chatButton.style.display = 'none';
    },
    
    // Show the button
    showButton: function() {
      chatButton.style.display = 'flex';
    },
    
    // Send message to chatbot
    sendMessage: function(message) {
      iframe.contentWindow.postMessage({
        type: 'CHATBOT_SEND_MESSAGE',
        message: message
      }, '*');
    },
    
    // Get iframe element (for advanced usage)
    getIframe: function() {
      return iframe;
    },
    
    // Get button element (for advanced usage)
    getButton: function() {
      return chatButton;
    }
  };

  console.log('Chatbot Embed API available: window.ChatbotEmbed');
})();


