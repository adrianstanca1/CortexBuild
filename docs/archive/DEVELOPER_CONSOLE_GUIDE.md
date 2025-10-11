# 🖥️ Developer Console - Interactive Development Environment

## 📋 **Overview**

The **Developer Console** is a specialized interface designed for developers who need active development tools, not just analytics dashboards. It provides an interactive environment similar to browser DevTools, allowing developers to write, test, and debug code in real-time.

---

## 👤 **Who Uses This?**

**User Class**: Developer  
**Role**: `developer`  
**Example User**: dev@constructco.com

This interface is **NOT** for:
- Super Admins (they use Developer Dashboard with analytics)
- Company Admins (they use Company Admin Dashboard)
- Supervisors or Operatives

---

## 🎯 **Key Differences from Developer Dashboard**

| Feature | Developer Dashboard | Developer Console |
|---------|-------------------|-------------------|
| **Purpose** | Analytics & Metrics | Active Development |
| **Primary Use** | View API usage, costs, trends | Write & execute code |
| **Widgets** | DeveloperFocusWidget, MetricsWidget | Code Editor, Console Output |
| **User Type** | Super Admin | Developer |
| **Interaction** | Read-only analytics | Interactive coding |
| **Focus** | Historical data & insights | Real-time execution |

---

## 🚀 **Features**

### 1. **Code Editor & Sandbox** 🎨

**What it does:**
- Write JavaScript code in a Monaco-like editor
- Execute code in a safe sandbox environment
- Real-time syntax highlighting
- Dark theme for comfortable coding

**How to use:**
1. Write your JavaScript code in the editor
2. Click "Run Code" to execute
3. View output in the Console Output panel
4. Save code to local storage for later

**Example:**
```javascript
// Write your code here
console.log("Hello, Developer!");

const data = { name: "CortexBuild", version: "2.0" };
console.log(data);

// Perform calculations
const result = Array.from({length: 10}, (_, i) => i * 2);
console.log("Even numbers:", result);
```

**Safety Features:**
- Sandboxed execution (no access to DOM or dangerous APIs)
- Error handling with detailed messages
- Execution time tracking
- Safe utilities (JSON, Math, Date, Array, Object, String, Number)

---

### 2. **Console Output** 📊

**What it does:**
- Displays real-time execution logs
- Color-coded message types (log, error, warn, info, success)
- Timestamps for each message
- Auto-scroll to latest output

**Message Types:**
- 🟢 **Log** - Standard console.log output
- 🔴 **Error** - Execution errors
- 🟡 **Warn** - Warning messages
- 🔵 **Info** - Informational messages
- ✅ **Success** - Successful operations

**Actions:**
- Clear console
- Auto-scroll to bottom
- Copy output
- View timestamps

---

### 3. **API Tester** ⚡

**What it does:**
- Test API endpoints without leaving the console
- Configure HTTP method (GET, POST, PUT, DELETE)
- Add custom headers
- Send request body (JSON)
- View formatted responses

**How to use:**
1. Select HTTP method (GET, POST, PUT, DELETE)
2. Enter API endpoint URL
3. Configure headers (JSON format)
4. Add request body (for POST/PUT)
5. Click "Send Request"
6. View response with execution time

**Example:**
```
Method: POST
URL: https://api.example.com/users
Headers:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-token"
}
Body:
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### 4. **Development Tools** 🛠️

**Available Tools:**
- **Code Snippets** - Saved code templates
- **Quick Actions** - Common development tasks
- **Settings** - Configure environment

**Coming Soon:**
- Code formatting
- Linting
- Auto-completion
- Debugging tools

---

## 💾 **Code Management**

### Save Code
- Click the **Save** icon to store code in local storage
- Code persists across sessions
- Automatic save on execution

### Load Code
- Click the **Upload** icon to load previously saved code
- Restores your last working state

### Download Code
- Click the **Download** icon to export code as `.js` file
- Useful for sharing or backup

### Clear Code
- Click **Clear** button to reset editor
- Starts with default template

---

## 🎨 **User Interface**

### Header
- **Title**: Developer Console
- **Subtitle**: Interactive Development Environment
- **Badge**: Developer Mode indicator

### Tabs
1. **Console & Sandbox** - Main coding interface
2. **API Tester** - API endpoint testing
3. **Dev Tools** - Additional utilities

### Layout
- **Left Panel**: Code Editor (50% width)
- **Right Panel**: Console Output (50% width)
- **Responsive**: Stacks vertically on mobile

---

## 🔒 **Security**

### Sandbox Restrictions
- No access to `window` or `document`
- No access to `localStorage` (except for code saving)
- No network requests (except through API Tester)
- No file system access
- No eval or Function constructor abuse

### Safe APIs
- ✅ console (log, error, warn, info)
- ✅ JSON (parse, stringify)
- ✅ Math (all methods)
- ✅ Date (all methods)
- ✅ Array (all methods)
- ✅ Object (all methods)
- ✅ String (all methods)
- ✅ Number (all methods)

### Blocked APIs
- ❌ window
- ❌ document
- ❌ fetch (use API Tester instead)
- ❌ XMLHttpRequest
- ❌ WebSocket
- ❌ localStorage (except for code saving)
- ❌ sessionStorage
- ❌ IndexedDB

---

## 📊 **Performance Metrics**

### Execution Time
- Displayed after each code run
- Measured in milliseconds
- Helps identify performance issues

### Console Logs
- Timestamped for debugging
- Color-coded for quick scanning
- Auto-scroll for latest output

---

## 🎯 **Use Cases**

### 1. Quick Code Testing
```javascript
// Test a function
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
```

### 2. Data Transformation
```javascript
// Transform API data
const users = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 }
];

const names = users.map(u => u.name);
console.log("Names:", names);
```

### 3. Algorithm Testing
```javascript
// Test sorting algorithm
const arr = [64, 34, 25, 12, 22, 11, 90];
arr.sort((a, b) => a - b);
console.log("Sorted:", arr);
```

### 4. API Endpoint Testing
- Test authentication endpoints
- Verify request/response formats
- Debug API errors
- Check response times

---

## 🚀 **Getting Started**

### Step 1: Login
```
Email: dev@constructco.com
Password: password123
```

### Step 2: Access Console
- You'll be automatically redirected to Developer Console
- No need to navigate manually

### Step 3: Start Coding
1. Write code in the editor
2. Click "Run Code"
3. View output in console
4. Iterate and improve

---

## 💡 **Tips & Tricks**

### Tip 1: Use console methods
```javascript
console.log("Standard log");
console.error("Error message");
console.warn("Warning message");
console.info("Info message");
```

### Tip 2: Save frequently
- Click Save icon after writing important code
- Code persists across sessions

### Tip 3: Test APIs incrementally
- Start with GET requests
- Add headers one at a time
- Verify responses before moving on

### Tip 4: Use execution time
- Monitor performance
- Optimize slow code
- Compare different approaches

---

## 🐛 **Troubleshooting**

### Code won't execute
- Check for syntax errors
- Verify console for error messages
- Try clearing and rewriting

### API requests fail
- Verify endpoint URL
- Check headers format (must be valid JSON)
- Ensure CORS is enabled on target API
- Check network connectivity

### Console not showing output
- Verify you're using console.log()
- Check if console is cleared
- Refresh the page

---

## 📚 **Examples**

### Example 1: Hello World
```javascript
console.log("Hello, Developer Console!");
```

### Example 2: Array Operations
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
```

### Example 3: Object Manipulation
```javascript
const user = { name: "Alice", age: 30 };
const updated = { ...user, age: 31 };
console.log("Updated user:", updated);
```

### Example 4: API Testing
```
Method: GET
URL: https://jsonplaceholder.typicode.com/users/1
Headers: { "Content-Type": "application/json" }
```

---

## 🎉 **Summary**

The **Developer Console** is your interactive development environment within CortexBuild. It provides:

- ✅ Real-time code execution
- ✅ Safe sandbox environment
- ✅ API testing capabilities
- ✅ Code management (save/load/download)
- ✅ Performance metrics
- ✅ Developer-friendly interface

**Perfect for**: Testing code snippets, debugging algorithms, API endpoint testing, and rapid prototyping.

---

**Last Updated**: 2025-01-10  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

