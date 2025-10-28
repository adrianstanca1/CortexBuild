# ASAgents Construction Platform

> 🎉 **Production Ready** - Version 2.5.0

A comprehensive construction management platform with AI-powered features, field operations support, and real-time collaboration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env.local

# Add your API keys to .env.local
# VITE_OPENAI_API_KEY=your_key_here
# VITE_GEMINI_API_KEY=your_key_here

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌟 Features

### Field Operations
- **Daily Logs** - Capture weather, labor, materials, and progress
- **My Day View** - Task management for field staff
- **RFI Management** - Create and track requests for information
- **Plans Viewer** - View and markup construction drawings
- **Offline Support** - Full offline capability for field use

### Project Management
- Multi-project dashboard with real-time metrics
- Task management with Kanban board
- Document management and version control
- Equipment and resource tracking
- Safety management and toolbox talks

### Financial Management
- Budget tracking and cost control
- Invoice and payment management
- Cost estimation tools
- Financial reporting and analytics

### AI-Powered Tools
- **AI Advisor** - Get intelligent project insights
- **AI Search** - Natural language search across projects
- **Site Inspector** - Automated quality checks
- **Risk Analysis** - Identify and mitigate risks
- **Predictive Analytics** - Forecast project outcomes

## 🛠 Technology Stack

- **Frontend**: React 19.2 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **Real-time**: Socket.IO
- **AI**: OpenAI + Google Gemini
- **State**: React Hooks + Context API

## 📁 Project Structure

```
asagents---final (3)/
├── components/         # 60+ React components
│   ├── Dashboard.tsx
│   ├── DailyLogField.tsx
│   ├── PlansViewerField.tsx
│   └── ...
├── services/          # API and service layer
│   ├── aiService.ts
│   ├── apiService.ts
│   └── socketService.ts
├── hooks/            # Custom React hooks
├── types.ts          # TypeScript definitions
├── App.tsx           # Main app component
└── index.tsx         # Entry point
```

## 🔧 Configuration

Create `.env.local` with:

```bash
# AI Services (Required)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_GEOFENCING=true
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Other Platforms
```bash
# Netlify
npm run deploy:netlify

# IONOS SFTP
npm run deploy:ionos

# Docker
npm run deploy:docker
```

## 📊 Current Status

- ✅ Core features complete
- ✅ Field operations ready
- ✅ AI features integrated
- ✅ Production deployed on Vercel
- 🔄 Backend API integration in progress
- 🔄 Mobile app (React Native) planned

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Encrypted API keys
- HTTPS enforced in production
- CORS protection

## 📈 Performance

- Build time: ~15-30 seconds
- Lighthouse score: 90+
- First paint: < 2 seconds
- Time to interactive: < 3 seconds

## 🤝 Contributing

This is a proprietary project. For access or contributions, contact the ASAgents team.

## 📄 License

Proprietary - ASAgents Construction Platform

## 🆘 Support

For technical support or questions:
- Review inline documentation in components
- Check `PROJECT_STATUS.md` for detailed status
- See `FIELD_CONSTRUCTION_ROADMAP.md` for future plans

---

**Built with ❤️ by ASAgents Development Team**
