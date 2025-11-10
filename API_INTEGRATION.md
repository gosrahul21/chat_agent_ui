# API Integration Guide

This document explains how the chat-ui integrates with the backend services.

## Architecture Overview

The chat-ui integrates with three backend services:

### 1. Authentication Service (Port 3001)
- **Purpose**: User authentication and authorization
- **Endpoints**: Login, signup, Google OAuth, token refresh
- **Used by**: `authService.ts`

### 2. Chat Agent Service (Port 3000)
- **Purpose**: Chatbot CRUD operations and chat functionality
- **Endpoints**: Chatbot management, send messages, chat history
- **Used by**: `chatbotService.ts`

### 3. RAG Model Service (Port 5000)
- **Purpose**: Document upload, training, and vector operations
- **Endpoints**: Document management, chatbot training
- **Used by**: `documentService.ts`

## Environment Configuration

Create a `.env` file in the `chat-ui` directory:

```env
# Authentication API (NestJS backend)
VITE_AUTH_API_URL=http://localhost:3001

# Chatbot API (Node.js/Express backend)
VITE_CHATBOT_API_URL=http://localhost:3000

# RAG API (Python/Flask backend for documents)
VITE_RAG_API_URL=http://localhost:5000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API Services

### 1. Authentication Service (`authService.ts`)

**Endpoints:**
- `POST /auth/login` - Email/password login
- `POST /auth/signup` - User registration
- `POST /auth/google/token` - Google OAuth login
- `GET /auth/` - Verify current token
- `GET /auth/refreshSession` - Refresh access token

**Features:**
- Automatic token refresh on 401 errors
- Token storage in localStorage
- Automatic logout on auth failure

### 2. Chatbot Service (`chatbotService.ts`)

**Endpoints:**
- `GET /api/chatbots/all` - Get all chatbots
- `GET /api/chatbots/:id` - Get specific chatbot
- `POST /api/chatbots` - Create chatbot
- `PUT /api/chatbots/:id` - Update chatbot
- `DELETE /api/chatbots/:id` - Delete chatbot
- `POST /api/chatbots/:id/chat` - Send message
- `GET /api/chatbots/:id/history` - Get chat history
- `DELETE /api/chatbots/:id/history` - Clear history

**Authentication:**
All endpoints require Bearer token in Authorization header.

**Response Format:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Document Service (`documentService.ts`)

**Endpoints:**
- `GET /api/chatbots/:id/documents` - List documents
- `POST /api/chatbots/:id/documents` - Upload document
- `DELETE /api/chatbots/:id/documents/:docId` - Delete document
- `POST /api/chatbots/:id/train` - Train chatbot with documents
- `GET /api/chatbots/:id/training-status` - Check training status

**File Upload:**
Uses `multipart/form-data` for file uploads.

**Supported File Types:**
- PDF (.pdf)
- Text (.txt)
- Markdown (.md)
- CSV (.csv)
- JSON (.json)
- Word (.doc, .docx)

## Data Flow

### Creating a Chatbot with Documents

1. User fills out chatbot form and selects files
2. Frontend calls `createChatbot()` in mockAPI
3. Chatbot is created via `chatbotService.createChatbot()`
4. Files are uploaded via `documentService.uploadDocuments()`
5. Chatbot is trained automatically via `documentService.trainChatbot()`
6. User can start chatting with the trained bot

### Sending a Message

1. User types message in chat interface
2. Frontend calls `sendMessage()` in mockAPI
3. Message is sent via `chatbotService.sendMessage()`
4. Backend processes with LangChain and vector context
5. Response includes:
   - AI response text
   - Context information
   - Timestamp
6. Frontend updates chat history

### Document Upload Flow

1. User uploads documents in settings modal
2. Frontend calls `uploadDocuments()` in mockAPI
3. Each file is uploaded to RAG service
4. Training is triggered automatically
5. Documents are embedded and stored in ChromaDB
6. Chatbot is ready to use document context

## Authentication Flow

### Login
1. User enters credentials
2. Frontend calls `authService.login()`
3. Backend validates and returns tokens
4. Tokens stored in localStorage
5. All subsequent API calls include Bearer token

### Token Refresh
1. API call returns 401 Unauthorized
2. Interceptor catches error
3. Calls `authService.refreshSession()`
4. New tokens stored
5. Original request retried with new token

### Logout
1. User clicks logout
2. Tokens cleared from localStorage
3. User redirected to login page

## Error Handling

### Network Errors
```typescript
try {
  const chatbots = await mockAPI.getChatbots();
} catch (error) {
  // Handle network error
  console.error('Failed to load chatbots:', error);
}
```

### Authentication Errors
- Automatic redirect to login on 401
- Token refresh attempted before logout
- Error messages displayed to user

### Validation Errors
- Backend validates all inputs
- Errors returned in response
- Frontend displays error messages

## Testing

### Start All Services

```bash
# Terminal 1: Auth Service
cd auth-server
npm run start:dev

# Terminal 2: Chat Agent
cd chat_agent
npm run dev

# Terminal 3: RAG Model
cd rag_model
source venv/bin/activate
python app.py

# Terminal 4: Frontend
cd chat-ui
npm run dev
```

### Test Endpoints

Use the provided example files:
- `rag_model/example_upload.py` - Test document upload
- `rag_model/example_train.py` - Test training
- `rag_model/example_vector.py` - Test vector queries

## CORS Configuration

### Backend CORS Setup

**chat_agent (Node.js):**
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**rag_model (Python):**
```python
CORS(app, origins=['http://localhost:5173'])
```

### Production CORS
Update origins to match your production frontend URL.

## Rate Limiting

Consider implementing rate limiting on:
- Authentication endpoints
- Chat message endpoints
- Document upload endpoints

## Security Best Practices

1. **Tokens**
   - Store in localStorage (or httpOnly cookies for production)
   - Include in Authorization header
   - Refresh before expiration

2. **API Keys**
   - Never commit .env files
   - Use different keys for dev/prod
   - Rotate keys regularly

3. **File Uploads**
   - Validate file types
   - Limit file sizes
   - Scan for malware in production

4. **HTTPS**
   - Use HTTPS in production
   - Secure all API endpoints
   - Enable HSTS headers

## Monitoring

### Logging
- API request/response times
- Error rates
- Authentication failures
- Document upload success rates

### Metrics
- Average chat response time
- Number of active chatbots
- Document processing time
- Training success rate

## Troubleshooting

### "Network Error"
- Check if all services are running
- Verify CORS configuration
- Check environment variables

### "Authentication Failed"
- Verify token is present
- Check token expiration
- Verify backend auth service is running

### "Document Upload Failed"
- Check file type is supported
- Verify file size is within limits
- Check RAG service is running
- Verify upload folder permissions

### "Training Failed"
- Check documents were uploaded
- Verify ChromaDB is accessible
- Check Python dependencies

## API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Customer Support Bot",
    "description": "Helps customers"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Bad request",
  "message": "Chatbot name is required"
}
```

### Chat Response
```json
{
  "success": true,
  "data": {
    "response": "Hello! How can I help you?",
    "hasContext": true,
    "context": "Retrieved from documents...",
    "timestamp": "2025-01-01T12:00:00Z"
  }
}
```

## Development Tips

1. **Use Real APIs Early**: Don't rely on mock data for too long
2. **Handle Loading States**: Show spinners during API calls
3. **Error Messages**: Display user-friendly error messages
4. **Retry Logic**: Implement retry for failed requests
5. **Offline Support**: Handle network disconnections gracefully

## Further Reading

- [Authentication Setup Guide](./AUTHENTICATION_SETUP.md)
- [Backend API Documentation](../chat_agent/README.md)
- [RAG Model Documentation](../rag_model/README.md)
- [Training Guide](../rag_model/QUICKSTART_TRAINING.md)

