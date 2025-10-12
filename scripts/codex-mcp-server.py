#!/usr/bin/env python3
"""
Codex MCP Server for CortexBuild Integration

This script provides a Python-based MCP server that integrates with the CortexBuild
TypeScript/Node.js application through the Codex CLI.
"""

import asyncio
import json
import sys
import os
from typing import Dict, Any, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

class CortexBuildCodexAgent:
    """
    Codex Agent specifically designed for CortexBuild platform integration
    """
    
    def __init__(self):
        self.session_id = os.getenv('CODEX_SESSION_ID', 'default')
        self.user_id = os.getenv('CODEX_USER_ID', 'anonymous')
        self.context_history = []
        
    async def process_chat_request(self, messages: list, contexts: list) -> Dict[str, Any]:
        """Process chat request with enhanced context from CortexBuild"""
        try:
            # Build enhanced prompt with CortexBuild context
            enhanced_prompt = self._build_enhanced_prompt(messages, contexts)
            
            # Process with Codex
            response = await self._generate_response(enhanced_prompt)
            
            return {
                "content": response,
                "session_id": self.session_id,
                "user_id": self.user_id,
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "session_id": self.session_id,
                "user_id": self.user_id
            }
    
    async def execute_code(self, code: str, language: str) -> Dict[str, Any]:
        """Execute code with CortexBuild context"""
        try:
            # Validate code execution request
            if not self._is_safe_code(code, language):
                return {
                    "error": "Code execution denied for security reasons",
                    "session_id": self.session_id
                }
            
            # Execute code based on language
            if language.lower() in ['typescript', 'javascript', 'ts', 'js']:
                result = await self._execute_typescript(code)
            elif language.lower() in ['python', 'py']:
                result = await self._execute_python(code)
            else:
                result = {"error": f"Unsupported language: {language}"}
            
            return {
                "result": result,
                "language": language,
                "session_id": self.session_id,
                "user_id": self.user_id
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "session_id": self.session_id
            }
    
    async def suggest_code(self, prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate code suggestions based on prompt and context"""
        try:
            # Build context-aware prompt
            enhanced_prompt = f"""
            CortexBuild Platform Code Suggestion Request:
            
            User Request: {prompt}
            
            Context: {json.dumps(context) if context else 'None'}
            
            Platform: TypeScript/Node.js with better-sqlite3
            Framework: React 19, Vite, Tailwind CSS
            
            Please provide code suggestions that:
            1. Follow TypeScript best practices
            2. Are compatible with the CortexBuild platform
            3. Use modern React patterns
            4. Include proper error handling
            5. Are production-ready
            
            Provide multiple suggestions if applicable.
            """
            
            suggestions = await self._generate_code_suggestions(enhanced_prompt)
            
            return {
                "suggestions": suggestions,
                "prompt": prompt,
                "context": context,
                "session_id": self.session_id,
                "user_id": self.user_id
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "session_id": self.session_id
            }
    
    def _build_enhanced_prompt(self, messages: list, contexts: list) -> str:
        """Build enhanced prompt with CortexBuild context"""
        prompt_parts = [
            "You are Codex, an advanced AI coding assistant integrated with the CortexBuild platform.",
            "",
            "CortexBuild Platform Details:",
            "- TypeScript/Node.js backend with better-sqlite3 database",
            "- React 19 frontend with Vite and Tailwind CSS",
            "- MCP (Model Context Protocol) for enhanced AI context",
            "- Base44Clone construction management features",
            "- Developer SDK and marketplace functionality",
            "",
            "Relevant Context:"
        ]
        
        # Add contexts
        for ctx in contexts:
            prompt_parts.append(f"- [{ctx.get('context_type', 'unknown')}]: {json.dumps(ctx.get('context_data', {}))}")
        
        prompt_parts.extend([
            "",
            "Conversation History:"
        ])
        
        # Add message history
        for msg in messages[-10:]:  # Last 10 messages
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            prompt_parts.append(f"{role.upper()}: {content}")
        
        return "\n".join(prompt_parts)
    
    async def _generate_response(self, prompt: str) -> str:
        """Generate AI response using Codex"""
        # This would integrate with actual Codex API
        # For now, return a structured response
        return f"""
        Based on the CortexBuild platform context, I can help you with:
        
        1. TypeScript/Node.js backend development
        2. React 19 frontend components
        3. better-sqlite3 database operations
        4. MCP context management
        5. Base44Clone feature implementation
        
        Please provide more specific details about what you'd like to accomplish.
        
        Session: {self.session_id}
        User: {self.user_id}
        """
    
    async def _execute_typescript(self, code: str) -> Dict[str, Any]:
        """Execute TypeScript code (simulation)"""
        # In a real implementation, this would use a secure sandbox
        return {
            "output": f"TypeScript code execution simulated:\n{code}",
            "status": "success",
            "language": "typescript"
        }
    
    async def _execute_python(self, code: str) -> Dict[str, Any]:
        """Execute Python code (simulation)"""
        # In a real implementation, this would use a secure sandbox
        return {
            "output": f"Python code execution simulated:\n{code}",
            "status": "success", 
            "language": "python"
        }
    
    async def _generate_code_suggestions(self, prompt: str) -> list:
        """Generate code suggestions"""
        # This would integrate with actual Codex API
        return [
            {
                "title": "TypeScript Component",
                "description": "React component with TypeScript",
                "code": "const MyComponent: React.FC = () => {\n  return <div>Hello CortexBuild!</div>;\n};",
                "language": "typescript"
            },
            {
                "title": "Database Query",
                "description": "better-sqlite3 query example",
                "code": "const result = db.prepare('SELECT * FROM users WHERE role = ?').all('developer');",
                "language": "typescript"
            }
        ]
    
    def _is_safe_code(self, code: str, language: str) -> bool:
        """Basic security check for code execution"""
        dangerous_patterns = [
            'eval(',
            'exec(',
            'import os',
            'subprocess',
            'file://',
            'http://',
            'https://',
            '__import__',
            'rm -rf',
            'del ',
            'DROP TABLE',
            'DELETE FROM'
        ]
        
        code_lower = code.lower()
        return not any(pattern.lower() in code_lower for pattern in dangerous_patterns)

async def main() -> None:
    """Main MCP server function"""
    print("🚀 Starting CortexBuild Codex MCP Server...")
    
    # Initialize Codex agent
    codex_agent = CortexBuildCodexAgent()
    
    async with MCPServerStdio(
        name="CortexBuild Codex CLI",
        params={
            "command": "npx",
            "args": ["-y", "codex", "mcp"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        print("✅ Codex MCP server started.")
        print(f"📋 Session ID: {codex_agent.session_id}")
        print(f"👤 User ID: {codex_agent.user_id}")
        
        # Message processing loop
        try:
            while True:
                # Read message from stdin
                line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
                if not line:
                    break
                
                try:
                    message = json.loads(line.strip())
                    message_id = message.get('id')
                    method = message.get('method')
                    params = message.get('params', {})
                    
                    print(f"📨 Received message: {method} (ID: {message_id})")
                    
                    # Process different message types
                    if method == 'chat':
                        result = await codex_agent.process_chat_request(
                            params.get('messages', []),
                            params.get('contexts', [])
                        )
                    elif method == 'execute':
                        result = await codex_agent.execute_code(
                            params.get('code', ''),
                            params.get('language', 'typescript')
                        )
                    elif method == 'suggest':
                        result = await codex_agent.suggest_code(
                            params.get('prompt', ''),
                            params.get('context')
                        )
                    else:
                        result = {"error": f"Unknown method: {method}"}
                    
                    # Send response
                    response = {
                        "id": message_id,
                        "result": result
                    }
                    
                    print(json.dumps(response))
                    sys.stdout.flush()
                    
                except json.JSONDecodeError:
                    print(json.dumps({
                        "error": "Invalid JSON message"
                    }))
                    sys.stdout.flush()
                except Exception as e:
                    print(json.dumps({
                        "error": str(e)
                    }))
                    sys.stdout.flush()
                    
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Codex MCP server...")
        except Exception as e:
            print(f"❌ Server error: {e}")
        
        print("👋 Codex MCP server stopped.")

if __name__ == "__main__":
    asyncio.run(main())
