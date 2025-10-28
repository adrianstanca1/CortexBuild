# 🚀 HOW TO ACCESS NEW AI & COLLABORATION FEATURES

## ✅ **FEATURES ARE NOW LIVE!**

Your CortexBuild platform now has **Real-time Collaboration** and **Advanced AI Assistant** fully integrated!

---

## 📍 **HOW TO ACCESS:**

### **Step 1: Open Your Browser**
Navigate to: **http://localhost:3000**

### **Step 2: Login**
- **Email:** `adrian.stanca1@gmail.com`
- **Password:** `password123`

### **Step 3: Go to Super Admin Dashboard**
After login, navigate to the **Super Admin Dashboard**

### **Step 4: Click the "🤖 AI & Collaboration" Tab**
You'll see it as the **second tab** in the navigation bar!

---

## 🎯 **WHAT YOU'LL SEE:**

### **1. AI Assistant (Left/Top Section)**
- 💬 **Chat Mode** - Ask questions about your projects
- 🔍 **Analyze Mode** - Get deep insights from your data
- 🔮 **Predict Mode** - Forecast project outcomes

**Try asking:**
- "Analyze my project budgets"
- "What are the risks in my current projects?"
- "Suggest a name for a new office building project"
- "Break down tasks for a renovation project"

### **2. Real-time Collaboration (Right/Bottom Section)**
- 👥 **Active Users** - See who's online right now
- 💬 **Team Chat** - Send instant messages
- 📊 **Activity Feed** - See live project updates

**To test real-time features:**
1. Keep your current browser tab open
2. Open a **new browser tab** or **incognito window**
3. Login with the same or different account
4. Watch the **Active Users** update in real-time!
5. Send a chat message and see it appear instantly!

---

## 🔧 **BACKEND ENDPOINTS AVAILABLE:**

### **AI Endpoints:**
```
POST   http://localhost:3001/api/ai/chat
POST   http://localhost:3001/api/ai/suggest
GET    http://localhost:3001/api/ai/usage
GET    http://localhost:3001/api/ai/conversations
```

### **WebSocket:**
```
WS     ws://localhost:3001/ws
```

---

## 💡 **QUICK TIPS:**

### **AI Assistant:**
1. Click **"New Conversation"** to start
2. Select your AI mode (Chat/Analyze/Predict)
3. Type your question
4. Get context-aware responses based on YOUR project data
5. Export conversations using the download button

### **Real-time Collaboration:**
1. Switch between tabs: **Active Users**, **Team Chat**, **Activity Feed**
2. See online status indicators (green = online)
3. Send messages in the chat
4. Watch activity updates in real-time

---

## 🎨 **VIEW OPTIONS:**

Use the toggle buttons at the top right:
- **Both** - See AI Assistant and Collaboration side-by-side
- **AI Assistant** - Focus on AI features only
- **Collaboration** - Focus on team features only

---

## 🧪 **TESTING REAL-TIME FEATURES:**

### **Test 1: User Presence**
1. Open http://localhost:3000 in **Chrome**
2. Login and go to AI & Collaboration tab
3. Open http://localhost:3000 in **Firefox** (or incognito)
4. Login with same/different account
5. **Watch both browsers** - you'll see the user count update!

### **Test 2: Live Chat**
1. With both browsers open (from Test 1)
2. In one browser, go to **Team Chat** tab
3. Type a message and click **Send**
4. **Watch the other browser** - message appears instantly!

### **Test 3: Activity Feed**
1. Keep AI & Collaboration tab open
2. Navigate to Projects page in another tab
3. Create/edit a project
4. **Return to AI & Collaboration** - see the activity logged!

---

## 🚀 **ADVANCED USAGE:**

### **AI Smart Suggestions:**
```javascript
// Get project name suggestions
POST /api/ai/suggest
{
  "type": "project_name",
  "context": {
    "description": "Modern office building renovation"
  }
}

// Get task breakdown
POST /api/ai/suggest
{
  "type": "task_breakdown",
  "context": {
    "projectName": "Office Renovation",
    "budget": 500000
  }
}
```

### **WebSocket Connection:**
```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Send chat message
ws.send(JSON.stringify({
  type: 'chat_message',
  message: 'Hello team!'
}));
```

---

## 📊 **FEATURES BREAKDOWN:**

### **AI Assistant Features:**
✅ Context-aware responses using YOUR project data
✅ 3 AI modes (Chat, Analyze, Predict)
✅ Conversation history with localStorage
✅ Export conversations to text files
✅ Smart suggestions for projects, tasks, budgets, risks
✅ Usage tracking and analytics
✅ Multi-conversation management

### **Collaboration Features:**
✅ Real-time user presence tracking
✅ Live status indicators (online/away/offline)
✅ Instant team chat messaging
✅ Activity feed with all user actions
✅ Auto-reconnect on disconnect
✅ Heartbeat mechanism for connection health
✅ JWT-based secure authentication

---

## 🎉 **YOU'RE ALL SET!**

**Open your browser now and try it:**
1. Go to http://localhost:3000
2. Login
3. Click **"🤖 AI & Collaboration"** tab
4. Start chatting with AI!
5. Open another tab to test real-time features!

---

## 🆘 **TROUBLESHOOTING:**

### **Can't see the tab?**
- Make sure you're logged in as Super Admin
- Refresh the page (Ctrl+R or Cmd+R)

### **WebSocket not connecting?**
- Check that backend is running on port 3001
- Look for "✅ WebSocket server initialized" in server logs

### **AI not responding?**
- Check your OpenAI API key in `.env.local`
- Look for errors in browser console (F12)

### **Real-time not working?**
- Open browser console (F12) and check for WebSocket errors
- Make sure you're using the same token in both tabs

---

**Built with ❤️ for CortexBuild Platform** 🚀

**Enjoy your new AI-powered, real-time collaborative construction management system!**

