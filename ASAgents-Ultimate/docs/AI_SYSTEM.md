# AI System Documentation

## Overview

The ASAgents AI system is a comprehensive multimodal, multilingual AI integration platform that provides seamless interaction with multiple AI providers including ChatGPT, Gemini, GitHub Copilot, and Anthropic Claude. The system is designed to work across different development environments and supports text, image, audio, video, and code processing.

## Architecture

### Core Components

1. **AI Providers** (`services/ai/providers.ts`)
   - Abstract base class for all AI providers
   - Unified interface for different AI services
   - Support for multimodal inputs and streaming responses

2. **Language Processing** (`services/ai/language.ts`)
   - Language detection and translation
   - Multilingual content management
   - Smart translation with context awareness

3. **Conversation Management** (`services/ai/conversation.ts`)
   - Intelligent conversation handling
   - Auto-provider selection based on content
   - Conversation export and import

4. **Multimodal Processing** (`services/ai/multimodal.ts`)
   - File processing (images, audio, video, documents, code)
   - Voice-to-text and text-to-speech
   - Image analysis and OCR

5. **Development Tools Integration** (`services/ai/development.ts`)
   - Cross-platform code assistance
   - Environment-specific optimizations
   - Code execution and analysis

## Installation and Setup

### Prerequisites

```bash
npm install @google/generative-ai
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# OpenAI API (when implemented)
VITE_OPENAI_API_KEY=your_openai_api_key

# Anthropic API (when implemented)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Basic Usage

```typescript
import { aiSystem } from './services/ai';

// Quick chat
const response = await aiSystem.chat('Hello, AI!');
console.log(response.response);

// Language detection
const language = await aiSystem.detectLanguage('Bonjour le monde');
console.log(language.code); // 'fr'

// Code analysis
const analysis = await aiSystem.analyzeCode(
  'function hello() { console.log("Hello"); }',
  'javascript'
);
console.log(analysis);

// Image processing
const imageFile = new File([/* ... */], 'image.jpg', { type: 'image/jpeg' });
const description = await aiSystem.processImage(imageFile);
console.log(description);
```

## Components

### AIChat Component

A full-featured chat interface with streaming responses and provider selection.

```tsx
import { AIChat } from './components/ai';

<AIChat
  defaultProvider="gemini"
  onConversationChange={(id) => console.log('Conversation:', id)}
  className="h-96"
/>
```

### AIFileUpload Component

Drag-and-drop file upload with automatic analysis.

```tsx
import { AIFileUpload } from './components/ai';

<AIFileUpload
  onFilesProcessed={(files) => console.log('Processed:', files)}
  onAnalysisComplete={(analysis) => console.log('Analysis:', analysis)}
  maxFiles={5}
/>
```

### AIVoiceInput Component

Voice recording and transcription interface.

```tsx
import { AIVoiceInput } from './components/ai';

<AIVoiceInput
  onTranscriptionComplete={(transcript) => console.log(transcript)}
  language="en"
/>
```

### AICodeAssistant Component

Code editor with AI-powered suggestions and analysis.

```tsx
import { AICodeAssistant } from './components/ai';

<AICodeAssistant
  language="typescript"
  filename="example.ts"
  onCodeChange={(code) => console.log('Code changed:', code)}
/>
```

### Complete AI Interface

All-in-one interface combining all AI capabilities.

```tsx
import AIInterface from './components/ai';

<AIInterface
  defaultView="chat"
  defaultProvider="gemini"
  onViewChange={(view) => console.log('View changed:', view)}
  className="w-full h-screen"
/>
```

## API Reference

### UnifiedAISystem

The main AI system class that coordinates all AI capabilities.

#### Methods

##### `chat(message: string, conversationId?: string, provider?: AIProvider)`
- **Description**: Send a message to AI and get a response
- **Parameters**:
  - `message`: The message to send
  - `conversationId`: Optional conversation ID to continue
  - `provider`: Optional AI provider to use
- **Returns**: `Promise<{ response: string; conversationId: string }>`

##### `translate(text: string, targetLanguage: string, context?: string)`
- **Description**: Translate text to target language
- **Parameters**:
  - `text`: Text to translate
  - `targetLanguage`: Target language code (e.g., 'es', 'fr')
  - `context`: Optional context for better translation
- **Returns**: `Promise<string>`

##### `detectLanguage(text: string)`
- **Description**: Detect the language of the given text
- **Parameters**:
  - `text`: Text to analyze
- **Returns**: `Promise<{ code: string; name: string; confidence: number }>`

##### `analyzeCode(code: string, language: string, filename?: string)`
- **Description**: Analyze code for quality, bugs, and improvements
- **Parameters**:
  - `code`: Code to analyze
  - `language`: Programming language
  - `filename`: Optional filename for context
- **Returns**: `Promise<string>`

##### `processImage(imageFile: File, question?: string)`
- **Description**: Analyze an image with optional question
- **Parameters**:
  - `imageFile`: Image file to analyze
  - `question`: Optional question about the image
- **Returns**: `Promise<string>`

### ConversationManager

Manages AI conversations with intelligent provider selection.

#### Methods

##### `createConversation(title: string, domain?: string, language?: string)`
- **Description**: Create a new conversation
- **Returns**: `string` (conversation ID)

##### `sendMessage(conversationId: string, content: string, input?: MultimodalInput, preferredProvider?: AIProvider)`
- **Description**: Send a message in a conversation
- **Returns**: `Promise<AIResponse>`

##### `streamMessage(conversationId: string, content: string, onChunk: (chunk: string) => void, input?: MultimodalInput, preferredProvider?: AIProvider)`
- **Description**: Send a message with streaming response
- **Returns**: `Promise<AIResponse>`

##### `exportConversation(conversationId: string, format?: 'json' | 'markdown' | 'txt')`
- **Description**: Export conversation in specified format
- **Returns**: `string`

### MultimodalHandler

Handles file processing and multimodal inputs.

#### Methods

##### `processFiles(files: FileList | File[])`
- **Description**: Process uploaded files
- **Returns**: `Promise<ProcessedFile[]>`

##### `processVoice(voiceInput: VoiceInput)`
- **Description**: Process voice input to text
- **Returns**: `Promise<VoiceOutput>`

##### `analyzeImage(image: File | string, provider?: AIProvider)`
- **Description**: Analyze image content
- **Returns**: `Promise<ImageAnalysis>`

### DevelopmentToolsIntegration

Provides development environment integration.

#### Methods

##### `getCodeCompletions(context: CodeContext, cursorPosition: { line: number; column: number })`
- **Description**: Get AI-powered code completions
- **Returns**: `Promise<CodeSuggestion[]>`

##### `executeCode(code: string, language: string, environmentId?: string)`
- **Description**: Execute code safely
- **Returns**: `Promise<ExecutionResult>`

## Provider Configuration

### Gemini Provider

Currently implemented and ready to use:

```typescript
const geminiProvider = new GeminiProvider();
// Automatically configured with environment variables
```

### OpenAI Provider (Coming Soon)

```typescript
// Will be implemented as:
const openaiProvider = new OpenAIProvider({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7
});
```

### Copilot Provider (Coming Soon)

```typescript
// Will integrate with GitHub Copilot API:
const copilotProvider = new CopilotProvider({
  // Configuration for GitHub Copilot
});
```

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const response = await aiSystem.chat('Hello');
  console.log(response.response);
} catch (error) {
  if (error.message.includes('API_KEY')) {
    console.error('API key not configured');
  } else if (error.message.includes('RATE_LIMIT')) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Performance Considerations

1. **Streaming**: Use streaming responses for better UX:
   ```typescript
   await conversationManager.streamMessage(
     conversationId,
     message,
     (chunk) => updateUI(chunk)
   );
   ```

2. **Provider Selection**: The system automatically selects the best provider based on content type and capabilities.

3. **Caching**: Conversations and processed files are cached in memory for better performance.

4. **Lazy Loading**: Components are loaded only when needed to reduce bundle size.

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite covers:
- Provider implementations
- Language processing
- Conversation management
- Multimodal processing
- Development tools integration
- Component functionality

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure environment variables are set correctly
   - Check API key permissions and quotas

2. **File Upload Issues**
   - Verify file types are supported
   - Check file size limits

3. **Voice Input Problems**
   - Ensure microphone permissions are granted
   - Check browser compatibility

4. **Code Execution Failures**
   - Only JavaScript/TypeScript execution is supported in browser
   - Server-side execution required for other languages

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('AI_DEBUG', 'true');
```

## Future Enhancements

1. **Additional Providers**: OpenAI, Anthropic, Cohere integration
2. **Advanced Multimodal**: Video analysis, real-time voice processing
3. **Collaboration**: Shared conversations, team workspaces
4. **Plugins**: Extensible plugin system for custom AI tools
5. **Mobile Support**: React Native components
6. **Offline Mode**: Local AI models for privacy-sensitive use cases

## Contributing

To add new AI providers:

1. Extend `AIProviderBase` class
2. Implement required methods
3. Add provider configuration
4. Include comprehensive tests
5. Update documentation

Example provider implementation:

```typescript
export class CustomProvider extends AIProviderBase {
  getName(): string {
    return 'custom';
  }

  async sendMessage(messages: AIMessage[], input?: MultimodalInput): Promise<AIResponse> {
    // Implementation
  }

  // ... other required methods
}
```

## License

This AI system is part of the ASAgents platform and follows the same licensing terms.