# ✅ API Integration Complete

The chat-ui has been successfully integrated with your backend services!

## What Was Done

### 1. Created Real API Services

**`src/services/authService.ts`**
- Handles user authentication
- Manages JWT tokens
- Automatic token refresh
- Google OAuth integration

**`src/services/chatbotService.ts`**
- Chatbot CRUD operations
- Send/receive messages
- Chat history management
- Integrates with chat_agent backend (Port 3000)

**`src/services/documentService.ts`**
- Document upload
- Document management
- Chatbot training
- Training status checks
- Integrates with rag_model backend (Port 5000)

### 2. Updated Mock API

**`src/data/mockData.ts`**
- Replaced all mock functions with real API calls
- Automatic chatbot training after document upload
- Proper error handling
- Seamless integration with existing UI

### 3. Created Comprehensive Documentation

**`AUTHENTICATION_SETUP.md`**
- Complete authentication setup guide
- Google OAuth configuration
- Security best practices
- Troubleshooting tips

**`API_INTEGRATION.md`**
- Architecture overview
- API endpoints reference
- Data flow diagrams
- Error handling patterns
- Testing guidelines

**`SETUP.md`**
- Quick start guide
- Environment configuration
- Running all services
- Troubleshooting common issues
- Production deployment guide

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Chat-UI Frontend                      │
│                    (React + Vite)                        │
│                     Port 5173                            │
└─────────────┬────────────────┬───────────────┬───────────┘
              │                │               │
              ▼                ▼               ▼
      ┌──────────────┐  ┌──────────┐  ┌──────────────┐
      │ Auth Service │  │  Chat    │  │   RAG Model  │
      │   (NestJS)   │  │  Agent   │  │   (Flask)    │
      │  Port 3001   │  │(Express) │  │  Port 5000   │
      └──────────────┘  │Port 3000 │  └──────┬───────┘
                        └────┬─────┘         │
                             │               │
                             ▼               ▼
                        ┌─────────┐    ┌──────────┐
                        │ MongoDB │    │ChromaDB  │
                        └─────────┘    └──────────┘
```

## Environment Setup

Create `.env` file in `chat-ui/`:

```env
# Authentication API
VITE_AUTH_API_URL=http://localhost:3001

# Chatbot API
VITE_CHATBOT_API_URL=http://localhost:3000

# RAG API (Document Upload & Training)
VITE_RAG_API_URL=http://localhost:5000

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Quick Start

### 1. Install Dependencies
```bash
cd chat-ui
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your backend URLs
```

### 3. Start Backend Services

**Terminal 1: Auth Service**
```bash
cd auth-server
npm run start:dev
```

**Terminal 2: Chat Agent**
```bash
cd chat_agent
npm run dev
```

**Terminal 3: RAG Model**
```bash
cd rag_model
source venv/bin/activate
python app.py
```

### 4. Start Frontend
```bash
cd chat-ui
npm run dev
```

### 5. Open Browser
Navigate to: `http://localhost:5173`

## Features Overview

### ✅ Authentication
- Email/password login and signup
- Google OAuth "Sign in with Google"
- Automatic token refresh
- Persistent sessions
- Secure logout

### ✅ Chatbot Management
- Create new chatbots
- Update chatbot settings
- Delete chatbots
- Custom system prompts
- Search functionality

### ✅ Document Management
- Upload documents (PDF, TXT, MD, CSV, JSON, DOC, DOCX)
- Automatic training after upload
- View all documents
- Delete documents
- Training status indicators

### ✅ Chat Functionality
- Real-time chat with AI
- Context-aware responses from documents
- Message history
- Clear chat history
- Loading states
- Error handling

## API Endpoints Used

### Authentication (`authService.ts`)
- `POST /auth/login` - Login
- `POST /auth/signup` - Sign up
- `POST /auth/google/token` - Google login
- `GET /auth/` - Verify token
- `GET /auth/refreshSession` - Refresh token

### Chatbots (`chatbotService.ts`)
- `GET /api/chatbots/all` - Get all chatbots
- `GET /api/chatbots/:id` - Get specific chatbot
- `POST /api/chatbots` - Create chatbot
- `PUT /api/chatbots/:id` - Update chatbot
- `DELETE /api/chatbots/:id` - Delete chatbot
- `POST /api/chatbots/:id/chat` - Send message
- `GET /api/chatbots/:id/history` - Get history
- `DELETE /api/chatbots/:id/history` - Clear history

### Documents (`documentService.ts`)
- `GET /api/chatbots/:id/documents` - List documents
- `POST /api/chatbots/:id/documents` - Upload document
- `DELETE /api/chatbots/:id/documents/:docId` - Delete document
- `POST /api/chatbots/:id/train` - Train chatbot
- `GET /api/chatbots/:id/training-status` - Training status

## Data Flow Examples

### Creating a Chatbot with Documents

1. User fills form and uploads files
2. Frontend calls `createChatbot()` → `chatbotService.createChatbot()`
3. Chatbot created in MongoDB
4. Documents uploaded → `documentService.uploadDocuments()`
5. Files saved to `uploads/` folder
6. Automatic training → `documentService.trainChatbot()`
7. Text extracted and chunked
8. Embeddings created and stored in ChromaDB
9. Chatbot ready for use!

### Sending a Message

1. User types message
2. Frontend calls `sendMessage()` → `chatbotService.sendMessage()`
3. Backend queries ChromaDB for relevant context
4. LangChain processes message with context
5. AI generates response
6. Response stored in chat history
7. Frontend displays response

## Key Features

### Automatic Training
Documents are automatically trained when:
- Creating a chatbot with initial documents
- Uploading new documents
- Deleting documents (retraining)

### Error Handling
- Network errors show user-friendly messages
- Failed uploads don't break the UI
- Training errors are logged but don't fail operations
- Authentication errors trigger re-login

### Token Management
- Automatic refresh on 401 errors
- Stored securely in localStorage
- Included in all API requests
- Cleared on logout

## Testing Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Login with Google (if configured)
- [ ] Token refresh works
- [ ] Logout works

### Chatbot Operations
- [ ] Create chatbot
- [ ] View chatbot list
- [ ] Search chatbots
- [ ] Update chatbot
- [ ] Delete chatbot

### Document Operations
- [ ] Upload single document
- [ ] Upload multiple documents
- [ ] View document list
- [ ] Delete document
- [ ] Check training status

### Chat Operations
- [ ] Send message
- [ ] Receive response
- [ ] View chat history
- [ ] Clear chat history
- [ ] Context-aware responses

## Common Issues

### "Cannot connect to backend"
✅ Check all services are running
✅ Verify `.env` URLs are correct
✅ Check CORS configuration

### "Authentication failed"
✅ Check auth service is running
✅ Verify MongoDB is accessible
✅ Clear localStorage and try again

### "Document upload failed"
✅ Check RAG service is running
✅ Verify file type is supported
✅ Check file size limits

### "Training failed"
✅ Verify documents were uploaded
✅ Check ChromaDB is accessible
✅ Review RAG service logs

## Next Steps

1. **Configure Google OAuth** (optional)
   - Get credentials from Google Cloud Console
   - Add to `.env` file
   - Test Google login

2. **Customize Chatbots**
   - Set custom system prompts
   - Upload training documents
   - Test different AI behaviors

3. **Production Deployment**
   - Update environment variables
   - Enable HTTPS
   - Configure CORS properly
   - Set up monitoring

4. **Enhance Features**
   - Add user preferences
   - Implement chatbot sharing
   - Add export functionality
   - Implement analytics

## Documentation

- 📖 [Setup Guide](./SETUP.md) - Complete setup instructions
- 🔐 [Authentication Setup](./AUTHENTICATION_SETUP.md) - Auth configuration
- 🔌 [API Integration](./API_INTEGRATION.md) - API details
- 🤖 [Backend Docs](../chat_agent/README.md) - Chat agent documentation
- 🧠 [RAG Model Docs](../rag_model/README.md) - Document processing

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend logs
3. Verify all services are running
4. Check browser console for errors
5. Test API endpoints directly

## Congratulations! 🎉

Your chat-ui is now fully integrated with all backend services and ready to use!

The mock data has been replaced with real API calls, so all operations now interact with your actual databases (MongoDB and ChromaDB).

Start by creating your first chatbot and uploading some documents to see it in action!

