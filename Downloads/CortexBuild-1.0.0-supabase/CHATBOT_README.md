# ConstructAI Global AI Chatbot

## Overview

The ConstructAI platform features a global AI chatbot assistant powered by Google Gemini 2.5 Flash. The chatbot is available on all pages after user authentication and provides intelligent assistance for construction project management.

## Features

### ✅ Implemented Features

1. **Global Availability**
   - Floating button in bottom-right corner (🤖)
   - Available on all pages after login
   - Persistent across navigation

2. **AI-Powered Responses**
   - Powered by Google Gemini 2.5 Flash
   - Context-aware conversations
   - Markdown formatting support

3. **User Context**
   - Knows user name, role, and company
   - Aware of current page
   - Personalized responses

4. **Security**
   - JWT authentication required
   - Multi-tenant data isolation
   - Secure API endpoints

5. **UI/UX**
   - Beautiful gradient design
   - Smooth animations
   - Loading states
   - Error handling
   - Chat history (in-memory)

## Architecture

### Frontend Components

```
components/chat/
├── ChatbotWidget.tsx          # Main chatbot UI component
├── ChatMessage.tsx            # Individual message display
└── ConfirmationMessage.tsx    # Action confirmation UI
```

### Backend API

```
server/
├── index.ts                   # Express server with chat endpoints
└── auth.ts                    # JWT authentication middleware

lib/ai/
├── gemini-client.ts          # Gemini API client
├── chat-tools.ts             # Tool execution engine
└── chat-permissions.ts       # Validation system
```

### API Endpoints

- `GET /api/chat/message` - Get chat history (currently returns empty array)
- `POST /api/chat/message` - Send message and get AI response

## Configuration

### Environment Variables

Required in `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Gemini Model

Currently using: `gemini-2.5-flash`
- Fast and reliable
- 1M token context window
- 65K token output limit

## Usage

### For Users

1. **Login** to the platform
2. **Look for the 🤖 button** in the bottom-right corner
3. **Click to open** the chat window
4. **Type your message** and press Enter or click Send
5. **Wait for AI response** (usually 1-3 seconds)

### Example Conversations

```
User: "Salut! Ce poți face pentru mine?"
AI: "Bună! Sunt asistentul tău AI pentru ConstructAI..."

User: "Câte proiecte active am?"
AI: "Momentan nu am acces la datele tale de proiecte..."

User: "Ajută-mă să înțeleg platforma"
AI: "Cu plăcere! ConstructAI este o platformă..."
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev:all

# Frontend only (port 3000)
npm run dev

# Backend only (port 3001)
npm run server
```

### Testing

1. **Manual Testing**
   - Login to http://localhost:3000
   - Click chatbot button
   - Send test messages
   - Verify responses

2. **API Testing**
   ```bash
   # Test Gemini API directly
   npx tsx test-gemini.ts
   ```

## Future Enhancements

### Planned Features

1. **Tool Calling**
   - Create/Read/Update/Delete operations
   - Project management actions
   - Invoice generation
   - Report creation

2. **Persistent Chat History**
   - Save conversations to database
   - Load history on chatbot open
   - Search through past conversations

3. **Advanced Context**
   - Access to real project data
   - Financial insights
   - Task management
   - Document search

4. **Confirmation System**
   - User approval for critical actions
   - Undo functionality
   - Action history

5. **Multi-language Support**
   - Romanian (primary)
   - English
   - Auto-detection

6. **Voice Input/Output**
   - Speech-to-text
   - Text-to-speech
   - Voice commands

## Troubleshooting

### Chatbot Button Not Visible

1. **Check if logged in** - Chatbot only shows after authentication
2. **Refresh page** - Sometimes HMR doesn't update correctly
3. **Check console** - Look for errors in browser console
4. **Verify server** - Make sure backend is running on port 3001

### API Errors

1. **404 Not Found**
   - Check Vite proxy configuration
   - Verify backend is running
   - Check API endpoint paths

2. **500 Internal Server Error**
   - Check Gemini API key in `.env.local`
   - Verify model name is correct
   - Check server logs for details

3. **401 Unauthorized**
   - Verify JWT token is valid
   - Check localStorage for `constructai_token`
   - Try logging out and back in

### Gemini API Issues

1. **Model Not Found**
   - Verify using `gemini-2.5-flash`
   - Check API key has access to model
   - Try listing available models

2. **Rate Limiting**
   - Gemini free tier has limits
   - Implement request throttling
   - Consider upgrading API plan

## Technical Details

### Authentication Flow

```
1. User logs in → JWT token generated
2. Token stored in localStorage
3. ChatbotWidget reads token
4. All API requests include Bearer token
5. Server validates token with middleware
6. Request processed if valid
```

### Message Flow

```
1. User types message
2. Frontend sends POST to /api/chat/message
3. Server authenticates request
4. Server builds chat context
5. Server calls Gemini API
6. Gemini generates response
7. Server returns response to frontend
8. Frontend displays message
```

### Context Building

```typescript
const chatContext = {
    userId: user.id,
    companyId: user.company_id,
    userName: user.name,
    companyName: user.company.name,
    userRole: user.role,
    currentPage: window.location.pathname,
    availableData: {
        // Future: projects, clients, invoices, etc.
    },
};
```

## Contributing

When adding new features:

1. **Update this README** with new capabilities
2. **Add tests** for new functionality
3. **Update TypeScript types** as needed
4. **Follow existing code style**
5. **Test thoroughly** before committing

## License

Proprietary - ConstructAI Platform

## Support

For issues or questions:
- Check this README first
- Review server logs
- Check browser console
- Contact development team

