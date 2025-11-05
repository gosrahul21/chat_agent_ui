# Chat Agent UI - Quick Start Guide

## 🚀 What's Built

A professional, production-ready React chat interface with:
- ✅ React 18 + TypeScript + Vite
- ✅ Tailwind CSS for styling
- ✅ Lucide React icons
- ✅ Fully responsive design
- ✅ Hardcoded mock data for demo
- ✅ Professional UI/UX

## 📦 Installation & Running

```bash
cd chat-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🎨 Features

### 1. Chatbot Dashboard
- View all chatbots
- Search functionality
- Select chatbot to chat

### 2. Chat Interface  
- Real-time messaging simulation
- User and assistant messages
- Message timestamps
- Context indicators (shows when RAG context is used)
- Auto-scroll to latest message
- Clear history option

### 3. Mock Data
- 3 pre-configured chatbots
- Sample conversations
- 1-second simulated response time

## 📁 Project Structure

```
chat-ui/
├── src/
│   ├── components/
│   │   ├── ChatbotCard.tsx       # Chatbot selector card
│   │   └── ChatInterface.tsx     # Main chat UI
│   ├── data/
│   │   └── mockData.ts           # Hardcoded data & API simulation
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
└── vite.config.ts                # Vite configuration
```

## 🎯 Key Components

### ChatbotCard
```typescript
// Displays chatbot in sidebar
<ChatbotCard 
  chatbot={chatbot}
  onSelect={setSelectedChatbotId}
  isSelected={chatbot.id === selectedChatbotId}
/>
```

### ChatInterface
```typescript
// Main chat area
<ChatInterface
  chatbotId={selectedChatbot.id}
  chatbotName={selectedChatbot.name}
  messages={messages}
  onSendMessage={handleSendMessage}
  onClearHistory={handleClearHistory}
  isLoading={isLoading}
/>
```

## 🔌 Connecting to Real Backend

When ready to connect to your Node.js/Express backend:

### Step 1: Update API calls in `App.tsx`

```typescript
// Replace mockAPI with real API calls

import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Get all chatbots
const { data } = await axios.get(`${API_URL}/chatbots`);
const bots = data.data;

// Send message
const { data } = await axios.post(
  `${API_URL}/chatbots/${chatbotId}/chat`,
  { message, userId: 'user123' }
);

// Get history
const { data } = await axios.get(
  `${API_URL}/chatbots/${chatbotId}/history`
);
```

### Step 2: Update types if needed

Check `src/types/index.ts` and match with your backend response format.

### Step 3: Handle errors

```typescript
try {
  const response = await axios.post(...);
  // handle success
} catch (error) {
  console.error('API Error:', error);
  // show error toast/message
}
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        600: '#your-darker-color',
      },
    },
  },
}
```

### Layout
- Sidebar width: `w-80` in `App.tsx`
- Max message width: `max-w-[70%]` in `ChatInterface.tsx`
- Header height: `py-4` in `App.tsx`

## 🧪 Testing the UI

### Test Cases:
1. ✅ Select different chatbots
2. ✅ Send messages
3. ✅ Clear chat history
4. ✅ Search chatbots
5. ✅ Keyboard shortcuts (Enter to send)
6. ✅ Loading states
7. ✅ Empty states

## 📱 Responsive Design

Current breakpoints:
- Desktop: Optimized for screens ≥ 1024px
- Tablet: Works on screens ≥ 768px
- Mobile: Needs some adjustments for < 768px

## 🚀 Build for Production

```bash
npm run build
```

Output in `dist/` folder, ready to deploy.

## 🔥 Next Steps

### Immediate:
1. Run `npm run dev` to see the UI
2. Test all features with mock data
3. Customize colors/branding

### Integration:
1. Connect to your Node.js backend
2. Replace mock API calls
3. Add authentication
4. Add error handling & toasts

### Enhancements:
- Add streaming responses
- File upload support
- Dark mode
- Mobile responsiveness
- User profiles
- Chat export

## 💡 Tips

- Use `Cmd+K` (Mac) or `Ctrl+K` (Windows) in your IDE to search files quickly
- Check browser console for any errors
- Mock data simulates 1-second delay - adjust in `mockData.ts`
- All components use TypeScript for type safety

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use different port
npm run dev -- --port 3001
```

**Tailwind styles not applying?**
- Check `tailwind.config.js` content paths
- Restart dev server
- Clear browser cache

**TypeScript errors?**
- Run `npm install` again
- Check `tsconfig.json`
- Restart VS Code

## 📞 Support

Check out:
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Happy coding! 🎉**

