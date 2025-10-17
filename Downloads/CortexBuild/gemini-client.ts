/**
 * Google Gemini API Client
 * Main AI assistant for the platform with extended capabilities
 */

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}

export interface ChatContext {
    userId: string;
    companyId: string;
    userName: string;
    companyName: string;
    userRole: string;
    currentPage?: string;
    availableData?: {
        projects?: any[];
        clients?: any[];
        invoices?: any[];
        recentActivity?: any[];
    };
}

export interface ToolCall {
    name: string;
    parameters: Record<string, any>;
}

export interface ChatResponse {
    message: string;
    toolCalls?: ToolCall[];
    metadata?: Record<string, any>;
}

export class GeminiChatbot {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private chatSession: ChatSession | null = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 2.5 Flash for fast and reliable responses
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 64,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });
    }

    /**
     * Initialize chat session with context
     */
    async initializeChat(context: ChatContext, history: ChatMessage[] = []): Promise<void> {
        const systemPrompt = this.buildSystemPrompt(context);
        
        // Convert history to Gemini format
        const geminiHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        this.chatSession = this.model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Înțeleg. Sunt asistentul tău AI personal pentru ConstructAI. Cum te pot ajuta astăzi?' }],
                },
                ...geminiHistory,
            ],
        });
    }

    /**
     * Send message and get response
     */
    async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
        if (!this.chatSession) {
            await this.initializeChat(context);
        }

        try {
            // Add context to message if needed
            const enhancedMessage = this.enhanceMessageWithContext(message, context);
            
            const result = await this.chatSession!.sendMessage(enhancedMessage);
            const response = result.response;
            const text = response.text();

            // Check for tool calls in response
            const toolCalls = this.extractToolCalls(text);

            return {
                message: this.cleanResponse(text),
                toolCalls,
                metadata: {
                    model: 'gemini-1.5-pro',
                    timestamp: new Date(),
                },
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to get response from AI assistant');
        }
    }

    /**
     * Build comprehensive system prompt
     */
    private buildSystemPrompt(context: ChatContext): string {
        return `Tu ești Asistentul AI Principal al platformei ConstructAI, un sistem avansat de management pentru construcții.

**IDENTITATE & ROL:**
- Nume: ConstructAI Assistant
- Rol: Asistent personal AI cu capabilități extinse
- Scop: Ajutor complet pentru utilizatori în gestionarea proiectelor de construcții

**CONTEXT UTILIZATOR:**
- Nume: ${context.userName}
- Companie: ${context.companyName}
- Rol: ${context.userRole}
- User ID: ${context.userId}
- Company ID: ${context.companyId}
${context.currentPage ? `- Pagina curentă: ${context.currentPage}` : ''}

**CAPABILITĂȚI:**
1. **Conversație Naturală**: Răspunde în limba română, natural și prietenos
2. **Acces Date**: Ai acces la toate datele companiei utilizatorului (proiecte, clienți, facturi, etc.)
3. **Analiză**: Poți analiza date și genera insights
4. **Acțiuni**: Poți executa acțiuni (create, update, delete) LA CEREREA utilizatorului
5. **Context-Aware**: Înțelegi contextul paginii și conversației

**DATE DISPONIBILE:**
${this.formatAvailableData(context.availableData)}

**REGULI IMPORTANTE:**
1. ✅ Respectă ÎNTOTDEAUNA izolarea multi-tenant (vezi doar datele companiei ${context.companyName})
2. ✅ Cere CONFIRMARE pentru acțiuni critice (delete, bugete mari)
3. ✅ Validează toate input-urile utilizatorului
4. ✅ Explică ce faci înainte să execuți acțiuni
5. ✅ Folosește date reale din context când răspunzi
6. ❌ NU accesa date din alte companii
7. ❌ NU executa acțiuni fără acordul utilizatorului

**TOOL CALLING:**
Când utilizatorul cere o acțiune, folosește următorul format:
[TOOL_CALL: nume_tool]
{
  "parametru1": "valoare1",
  "parametru2": "valoare2"
}
[/TOOL_CALL]

**TOOLS DISPONIBILE:**
- get_projects: Obține lista de proiecte
- get_project_details: Detalii despre un proiect specific
- create_project: Creează proiect nou
- update_project: Actualizează proiect
- delete_project: Șterge proiect (cere confirmare!)
- get_clients: Obține lista de clienți
- create_client: Creează client nou
- get_invoices: Obține facturi
- create_invoice: Creează factură nouă
- get_financial_summary: Rezumat financiar
- get_cognitive_insights: Insights din Cognitive Core
- analyze_data: Analizează date și generează raport

**STIL DE COMUNICARE:**
- Prietenos și profesional
- Concis dar complet
- Folosește emoji-uri relevant (📊 📈 💰 🏗️ ✅ ⚠️)
- Structurează răspunsurile cu bullet points când e relevant
- Oferă exemple concrete

**EXEMPLE DE INTERACȚIUNI:**

User: "Câte proiecte active am?"
Tu: "📊 Ai **5 proiecte active** în acest moment:
1. Residential Complex Alpha - 45% progres
2. Office Building Beta - 67% progres
...
Vrei detalii despre vreunul dintre ele?"

User: "Creează un proiect nou pentru clientul ABC"
Tu: "✅ Bineînțeles! Pentru a crea proiectul, am nevoie de câteva detalii:
- Nume proiect?
- Buget estimat?
- Data de start?
- Prioritate (low/medium/high/critical)?

Sau pot crea un proiect cu setări default și le ajustăm după?"

Ești gata să ajuți utilizatorul ${context.userName}!`;
    }

    /**
     * Format available data for context
     */
    private formatAvailableData(data?: ChatContext['availableData']): string {
        if (!data) return 'Nu sunt date disponibile momentan.';

        const parts: string[] = [];

        if (data.projects && data.projects.length > 0) {
            parts.push(`- Proiecte: ${data.projects.length} proiecte disponibile`);
        }

        if (data.clients && data.clients.length > 0) {
            parts.push(`- Clienți: ${data.clients.length} clienți`);
        }

        if (data.invoices && data.invoices.length > 0) {
            parts.push(`- Facturi: ${data.invoices.length} facturi`);
        }

        if (data.recentActivity && data.recentActivity.length > 0) {
            parts.push(`- Activitate recentă: ${data.recentActivity.length} evenimente`);
        }

        return parts.length > 0 ? parts.join('\n') : 'Nu sunt date disponibile momentan.';
    }

    /**
     * Enhance message with current context
     */
    private enhanceMessageWithContext(message: string, context: ChatContext): string {
        // Add page context if relevant
        if (context.currentPage) {
            return `[Pagina curentă: ${context.currentPage}]\n${message}`;
        }
        return message;
    }

    /**
     * Extract tool calls from response
     */
    private extractToolCalls(text: string): ToolCall[] {
        const toolCalls: ToolCall[] = [];
        const regex = /\[TOOL_CALL:\s*(\w+)\]\s*({[\s\S]*?})\s*\[\/TOOL_CALL\]/g;
        
        let match;
        while ((match = regex.exec(text)) !== null) {
            try {
                const name = match[1];
                const parameters = JSON.parse(match[2]);
                toolCalls.push({ name, parameters });
            } catch (error) {
                console.error('Failed to parse tool call:', error);
            }
        }

        return toolCalls;
    }

    /**
     * Clean response by removing tool call markers
     */
    private cleanResponse(text: string): string {
        return text.replace(/\[TOOL_CALL:[\s\S]*?\[\/TOOL_CALL\]/g, '').trim();
    }

    /**
     * Reset chat session
     */
    resetSession(): void {
        this.chatSession = null;
    }
}

// Singleton instance
let geminiChatbot: GeminiChatbot | null = null;

export function getGeminiChatbot(): GeminiChatbot {
    if (!geminiChatbot) {
        geminiChatbot = new GeminiChatbot();
    }
    return geminiChatbot;
}

