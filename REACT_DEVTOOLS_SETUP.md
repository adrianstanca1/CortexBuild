# 🛠️ React DevTools Setup Guide

## 🎯 **Overview**

React DevTools provides powerful debugging and profiling capabilities for React applications. This guide will help you set up and use React DevTools with CortexBuild 2.0.

---

## 🌐 **Browser Extension Installation**

### **Chrome/Chromium Browsers**
1. **Visit Chrome Web Store**: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
2. **Click "Add to Chrome"**
3. **Confirm installation**
4. **Restart browser** (recommended)

### **Firefox**
1. **Visit Firefox Add-ons**: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
2. **Click "Add to Firefox"**
3. **Confirm installation**
4. **Restart browser** (recommended)

### **Safari**
1. **Install from Mac App Store**: Search for "React Developer Tools"
2. **Enable in Safari Extensions**

---

## 📦 **Standalone Version (Already Installed)**

We've already installed the standalone React DevTools in your project:

```bash
# Start standalone React DevTools
npm run devtools

# Start full development environment (App + API + DevTools)
npm run dev:full
```

---

## 🔧 **Usage Instructions**

### **🌐 Browser Extension Usage**

1. **Open CortexBuild**: Navigate to http://localhost:3002/
2. **Open Developer Tools**: Press `F12` or `Cmd+Option+I` (Mac)
3. **Find React Tabs**: Look for "⚛️ Components" and "⚛️ Profiler" tabs
4. **Start Debugging**: Explore component tree, props, state, and hooks

### **📱 Standalone Application Usage**

1. **Start DevTools**: Run `npm run devtools` in terminal
2. **Connect to App**: DevTools will automatically detect React apps
3. **Debug Interface**: Use the standalone window for debugging

---

## 🎯 **Key Features**

### **🔍 Component Inspector**
- **Component Tree**: Navigate React component hierarchy
- **Props & State**: Inspect component props and state in real-time
- **Hooks**: Debug useState, useEffect, and custom hooks
- **Context**: View React Context values and providers

### **⚡ Performance Profiler**
- **Render Performance**: Identify slow-rendering components
- **Commit Timeline**: Analyze render commits and timing
- **Flame Graph**: Visualize component render times
- **Interactions**: Track user interactions and their impact

### **🔧 Advanced Features**
- **Component Highlighting**: Highlight components on hover
- **Props Editing**: Modify props and state for testing
- **Console Integration**: Access selected component via `$r`
- **Source Maps**: Jump to component source code

---

## 🚀 **CortexBuild-Specific Tips**

### **🏗️ Debugging Construction Components**
- **Project Components**: Inspect `ProjectHomeScreen`, `ProjectsListScreen`
- **Task Management**: Debug `TasksScreen`, `MyTasksScreen` state
- **Dashboard Components**: Analyze `UnifiedDashboardScreen` performance
- **AI Components**: Monitor `AIInsightsScreen` data flow

### **📊 Performance Optimization**
- **Large Lists**: Profile `ProjectsListScreen` with many projects
- **Real-time Updates**: Monitor WebSocket data in dashboard components
- **Chart Components**: Analyze rendering performance of analytics charts
- **Modal Components**: Debug modal state management

### **🔍 Common Debugging Scenarios**
```javascript
// Access selected component in console
$r.props    // View component props
$r.state    // View component state (class components)
$r.hooks    // View hooks (functional components)

// Trigger re-renders for testing
$r.forceUpdate()  // Class components
// For functional components, modify state via DevTools
```

---

## 🎨 **DevTools Configuration**

### **⚙️ Settings & Preferences**
1. **Open DevTools Settings**: Click gear icon in React DevTools
2. **Enable Profiler**: Check "Record why each component rendered"
3. **Highlight Updates**: Enable "Highlight updates when components render"
4. **Component Filters**: Hide DOM components for cleaner view

### **🎯 Useful Settings for CortexBuild**
- ✅ **Hide DOM components**: Focus on React components only
- ✅ **Record component render reasons**: Debug unnecessary re-renders
- ✅ **Highlight updates**: Visualize component updates
- ✅ **Enable profiler**: Track performance metrics

---

## 🔧 **Development Workflow**

### **🚀 Quick Start Commands**
```bash
# Start everything (recommended for development)
npm run dev:full

# Or start individually:
npm run dev          # Vite dev server
npm run api-server   # API server
npm run devtools     # Standalone React DevTools
```

### **🐛 Debugging Workflow**
1. **Start Development**: `npm run dev:full`
2. **Open Browser**: Navigate to http://localhost:3002/
3. **Open DevTools**: Press F12 and find React tabs
4. **Select Component**: Click on component in tree
5. **Inspect & Debug**: View props, state, hooks
6. **Profile Performance**: Use Profiler tab for optimization

---

## 📚 **Additional Resources**

### **📖 Documentation**
- **Official Docs**: https://react.dev/learn/react-developer-tools
- **Profiler Guide**: https://react.dev/reference/react/Profiler
- **Debugging Guide**: https://react.dev/learn/react-developer-tools

### **🎥 Video Tutorials**
- **React DevTools Overview**: https://www.youtube.com/watch?v=DQjMiKEwl_E
- **Performance Profiling**: https://www.youtube.com/watch?v=00RoZflFE34

---

## 🎉 **Installation Complete!**

React DevTools is now set up for CortexBuild 2.0 development. Use the browser extension for the best experience, or the standalone version for advanced debugging scenarios.

**Happy debugging! 🐛➡️✨**
