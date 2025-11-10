# Chat-UI Setup Guide

Complete setup guide for running the chat-ui with all backend services.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Python 3.8+ installed
- MongoDB running
- npm or yarn package manager

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the `chat-ui` directory:

```bash
cp .env.example .env
```

Update the environment variables:

```env
# Authentication API (NestJS backend)
VITE_AUTH_API_URL=http://localhost:3001

# Chatbot API (Node.js/Express backend)
VITE_CHATBOT_API_URL=http://localhost:3000

# RAG API (Python/Flask backend for documents)
VITE_RAG_API_URL=http://localhost:5000

# Google OAuth Client ID (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. Install Dependencies

```bash
cd chat-ui
npm install
```

### 3. Start All Services

You need to run 4 services in separate terminals:

#### Terminal 1: Authentication Service (Port 3001)
```bash
cd auth-server
npm install
npm run start:dev
```

#### Terminal 2: Chat Agent Service (Port 3000)
```bash
cd chat_agent
npm install
npm run dev
```

#### Terminal 3: RAG Model Service (Port 5000)
```bash
cd rag_model
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Terminal 4: Frontend (Port 5173)
```bash
cd chat-ui
npm run dev
```

### 4. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## First Time Setup

### 1. Create an Account

- Click "Sign up" on the login page
- Fill in your details (name, email, username, password)
- Or use "Sign in with Google" (if configured)

### 2. Create Your First Chatbot

- Click "New Chatbot" button
- Enter chatbot name and description
- Optionally set a system prompt
- Optionally upload training documents
- Click "Create"

### 3. Upload Documents (Optional)

- Select a chatbot
- Click the settings icon
- Go to "Documents" tab
- Upload PDF, TXT, MD, CSV, or JSON files
- Documents will be automatically processed and embedded

### 4. Start Chatting

- Select a chatbot from the sidebar
- Type your message in the chat input
- The bot will respond using its training data

## Features

### Authentication
- ✅ Email/password login and signup
- ✅ Google OAuth login
- ✅ Automatic token refresh
- ✅ Persistent sessions

### Chatbot Management
- ✅ Create, update, delete chatbots
- ✅ Set custom system prompts
- ✅ View all chatbots in sidebar
- ✅ Search chatbots

### Document Management
- ✅ Upload multiple documents
- ✅ Support for PDF, TXT, MD, CSV, JSON, DOC, DOCX
- ✅ Automatic training after upload
- ✅ View uploaded documents
- ✅ Delete documents

### Chat Features
- ✅ Real-time chat with AI
- ✅ Context-aware responses from documents
- ✅ Chat history
- ✅ Clear chat history
- ✅ Message timestamps

## Architecture

```
┌─────────────┐
│  Chat-UI    │  (React/Vite - Port 5173)
│  Frontend   │
└──────┬──────┘
       │
       ├────────────────────┬────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Auth       │      │  Chat       │      │  RAG        │
│  Service    │      │  Agent      │      │  Model      │
│  (NestJS)   │      │  (Express)  │      │  (Flask)    │
│  Port 3001  │      │  Port 3000  │      │  Port 5000  │
└─────────────┘      └──────┬──────┘      └──────┬──────┘
                            │                     │
                            ▼                     ▼
                      ┌─────────────┐      ┌─────────────┐
                      │  MongoDB    │      │  ChromaDB   │
                      └─────────────┘      └─────────────┘
```

## API Integration

The frontend integrates with three backend services:

### 1. Authentication Service (`authService.ts`)
- User login/signup
- Token management
- Google OAuth

### 2. Chatbot Service (`chatbotService.ts`)
- Chatbot CRUD operations
- Send/receive messages
- Chat history management

### 3. Document Service (`documentService.ts`)
- Document upload
- Document management
- Chatbot training
- Training status

## Troubleshooting

### "Cannot connect to backend"
**Problem**: Frontend can't reach backend services

**Solutions**:
1. Check all backend services are running
2. Verify environment variables in `.env`
3. Check CORS configuration in backends
4. Verify ports are not in use

### "Authentication failed"
**Problem**: Login doesn't work

**Solutions**:
1. Verify auth service is running on port 3001
2. Check MongoDB is running
3. Clear browser localStorage
4. Check backend logs for errors

### "Chatbot creation failed"
**Problem**: Can't create new chatbots

**Solutions**:
1. Verify you're logged in (check token in localStorage)
2. Check chat agent service is running on port 3000
3. Verify MongoDB connection
4. Check backend validation errors

### "Document upload failed"
**Problem**: Can't upload documents

**Solutions**:
1. Verify RAG service is running on port 5000
2. Check file type is supported
3. Verify file size is reasonable (<10MB recommended)
4. Check `uploads/` folder permissions
5. Check Python dependencies are installed

### "Training failed"
**Problem**: Chatbot training doesn't work

**Solutions**:
1. Verify documents were uploaded successfully
2. Check ChromaDB is accessible
3. Check Python dependencies (sentence-transformers)
4. Review RAG service logs
5. Verify `chroma_db/` folder permissions

### "Chat responses are slow"
**Problem**: Messages take long time to respond

**Solutions**:
1. Check if chatbot is trained (upload documents first)
2. Verify OpenAI API key is set (if using OpenAI)
3. Check network connection
4. Review backend performance
5. Consider using smaller documents

## Development

### Hot Reload
All services support hot reload:
- Frontend: Vite dev server
- Auth: NestJS watch mode
- Chat Agent: Nodemon
- RAG: Flask debug mode (set `DEBUG=True` in `config.py`)

### Debugging

**Frontend**:
```bash
# Open browser DevTools
# Check Console for errors
# Check Network tab for API calls
```

**Backend**:
```bash
# Check terminal logs
# Enable debug mode
# Use console.log / print statements
```

### API Testing

Use Postman or curl to test APIs:

```bash
# Test auth
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUserName":"user@example.com","password":"password"}'

# Test chatbot creation
curl -X POST http://localhost:3000/api/chatbots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Bot","description":"A test bot"}'

# Test document upload
curl -X POST http://localhost:5000/api/chatbots/CHATBOT_ID/documents \
  -F "file=@document.pdf"
```

## Production Deployment

### Build Frontend
```bash
cd chat-ui
npm run build
```

The `dist/` folder contains the production build.

### Deploy Backend Services

1. **Set environment variables** for production
2. **Enable HTTPS** on all services
3. **Configure CORS** to allow production frontend URL
4. **Set secure tokens** and secrets
5. **Use production databases**
6. **Enable logging** and monitoring
7. **Set up rate limiting**
8. **Configure file upload limits**

### Environment Variables (Production)

```env
VITE_AUTH_API_URL=https://auth.yourdomain.com
VITE_CHATBOT_API_URL=https://api.yourdomain.com
VITE_RAG_API_URL=https://rag.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-production-client-id
```

## Additional Resources

- [Authentication Setup](./AUTHENTICATION_SETUP.md)
- [API Integration](./API_INTEGRATION.md)
- [Backend Documentation](../chat_agent/README.md)
- [RAG Model Guide](../rag_model/README.md)
- [Training Guide](../rag_model/QUICKSTART_TRAINING.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs
3. Check browser console for errors
4. Verify all services are running
5. Test API endpoints directly

## Updates

### Version 1.0.0
- ✅ Complete authentication system
- ✅ Real API integration
- ✅ Document upload and training
- ✅ Chat functionality with vector context
- ✅ Chatbot management UI
- ✅ Google OAuth integration

