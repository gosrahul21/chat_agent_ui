# Authentication Setup Guide

This guide will help you set up authentication with email/password login and Google OAuth in the Chat UI.

## Prerequisites

1. A running backend authentication server (see the backend documentation)
2. Google OAuth credentials (if using Google login)

## Environment Configuration

1. Create a `.env` file in the `chat-ui` directory:

```bash
cp .env.example .env
```

2. Update the environment variables:

```env
# Backend API URL - Update with your backend URL
VITE_AUTH_API_URL=http://localhost:3001

# Google OAuth Client ID - Get from Google Cloud Console
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Add authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
7. Click **Create** and copy your **Client ID**

### 2. Configure Environment

Add your Google Client ID to `.env`:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

## Backend API Configuration

The frontend expects the following authentication endpoints on your backend:

### Email/Password Authentication

- **POST** `/auth/signup` - Create a new user account
  ```json
  {
    "email": "user@example.com",
    "userName": "username",
    "password": "password",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- **POST** `/auth/login` - Login with email/username and password
  ```json
  {
    "emailOrUserName": "user@example.com",
    "password": "password"
  }
  ```

### Google OAuth

- **POST** `/auth/google/token` - Login with Google ID token
  ```json
  {
    "token": "google-id-token"
  }
  ```

### Token Management

- **GET** `/auth/` - Verify current token and get user info
  - Headers: `Authorization: Bearer <access-token>`

- **GET** `/auth/refreshSession` - Refresh access token
  - Headers: `refresh-token: Bearer <refresh-token>`

## Features

### Implemented Features

✅ Email/Password Login
✅ User Registration
✅ Google OAuth Login
✅ Automatic token refresh
✅ Persistent authentication (localStorage)
✅ Protected routes
✅ User profile display
✅ Logout functionality

### User Experience

1. **First Time Users**: See the signup page with options to:
   - Create account with email/password
   - Sign up with Google

2. **Returning Users**: See the login page with options to:
   - Login with email/username and password
   - Login with Google

3. **Authenticated Users**: Get access to:
   - Full chat application
   - User profile in header
   - Logout button

## Security Features

- Passwords are sent securely to the backend (ensure HTTPS in production)
- JWT tokens stored in localStorage
- Automatic token refresh on expiration
- Token validation on app load
- Secure logout (clears all tokens)

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production Deployment

1. Update environment variables for production:
   ```env
   VITE_AUTH_API_URL=https://your-api.com
   VITE_GOOGLE_CLIENT_ID=your-production-client-id
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting provider

4. Ensure your backend API allows CORS from your frontend domain

5. Update Google OAuth authorized origins to include your production domain

## Troubleshooting

### Google Login Not Working

1. **Check Client ID**: Ensure `VITE_GOOGLE_CLIENT_ID` is set correctly
2. **Check Origins**: Make sure your domain is added to authorized origins
3. **Check Backend**: Verify the backend `/auth/google/token` endpoint is working

### Token Refresh Issues

1. **Check Refresh Token**: Ensure refresh token is being stored
2. **Check Backend**: Verify `/auth/refreshSession` endpoint
3. **Clear Storage**: Try clearing localStorage and logging in again

### API Connection Issues

1. **Check Backend URL**: Verify `VITE_AUTH_API_URL` is correct
2. **Check CORS**: Ensure backend allows requests from frontend domain
3. **Check Network**: Open browser dev tools and check network requests

### Login Redirects to Login Page

1. **Check Token**: Verify access token is being stored after login
2. **Check User Data**: Ensure user data is being stored correctly
3. **Check Auth Context**: Verify AuthProvider is wrapping the app

## Security Best Practices

### For Development
- Use `http://localhost` for OAuth origins
- Never commit `.env` files to git
- Use strong passwords for testing

### For Production
- Always use HTTPS
- Implement rate limiting on auth endpoints
- Use secure, httpOnly cookies for tokens (if possible)
- Enable CORS only for your frontend domain
- Implement session timeout
- Add brute force protection
- Monitor failed login attempts
- Implement 2FA for admin accounts

## API Response Examples

### Successful Login Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe",
    "picture": "https://example.com/photo.jpg",
    "roles": []
  }
}
```

### Error Response
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the network tab for API request/response details
3. Verify all environment variables are set correctly
4. Ensure the backend is running and accessible

