# Chat Agent UI

A professional React + TypeScript + Tailwind CSS chat interface for AI-powered chatbots.

## Features

✨ **Modern UI/UX**
- Clean, professional design
- Responsive layout
- Smooth animations
- Real-time updates

🤖 **Chatbot Management**
- Multiple chatbot support
- Search functionality
- Chat history
- Context indicators

💬 **Chat Interface**
- Real-time messaging
- Message history
- Clear history option
- Loading states
- Keyboard shortcuts

## Tech Stack

- ⚡️ Vite - Lightning-fast build tool
- ⚛️ React 18 - UI library
- 🔷 TypeScript - Type safety
- 🎨 Tailwind CSS - Utility-first CSS
- 📦 Lucide React - Beautiful icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
chat-ui/
├── src/
│   ├── components/         # React components
│   │   ├── ChatbotCard.tsx
│   │   └── ChatInterface.tsx
│   ├── data/              # Mock data
│   │   └── mockData.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
└── package.json           # Dependencies
```

## Components

### ChatbotCard
Displays chatbot information in the sidebar
- Name and description
- Created date
- Selection state
- Click to select

### ChatInterface
Main chat interface
- Message list with auto-scroll
- User and assistant messages
- Message timestamps
- Context indicators
- Input with keyboard shortcuts
- Clear history button

## Mock Data

Currently using hardcoded data in `src/data/mockData.ts`:
- 3 sample chatbots
- Pre-filled chat history
- Simulated API responses

## API Integration

To connect to your real backend:

1. Replace `mockAPI` calls in `App.tsx`
2. Update types in `src/types/index.ts`
3. Add axios configuration for your backend URL

Example:

```typescript
// Before (mock)
const bots = await mockAPI.getChatbots();

// After (real API)
const response = await axios.get('/api/chatbots');
const bots = response.data.data;
```

## Customization

### Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your brand colors
      },
    },
  },
}
```

### Components

All components are in `src/components/` and can be easily customized.

## Features Coming Soon

- [ ] Connect to real backend API
- [ ] User authentication
- [ ] File upload support
- [ ] Streaming responses
- [ ] Dark mode
- [ ] Mobile responsive improvements
- [ ] Voice input
- [ ] Export chat history

## Screenshots

### Dashboard
![Dashboard view with chatbot list and chat interface]

### Chat Interface
![Active conversation with context indicators]

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
# chat_agent_ui
