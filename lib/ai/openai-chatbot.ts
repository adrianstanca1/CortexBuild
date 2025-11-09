/**
 * OpenAI Chatbot Client
 * Alternative AI assistant using OpenAI GPT models
 */

import OpenAI from 'openai';

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

export interface ChatResponse {
    message: string;
    toolCalls?: any[];
    metadata?: Record<string, any>;
}

export class OpenAIChatbot {
    private openai: OpenAI;
    private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    /**
     * Initialize chat session with context
     */
    async initializeChat(context: ChatContext, history: ChatMessage[] = []): Promise<void> {
        const systemPrompt = this.buildSystemPrompt(context);
        
        // Initialize conversation with system prompt
        this.conversationHistory = [
            {
                role: 'system',
                content: systemPrompt,
            },
        ];

        // Add history if available
        if (history.length > 0) {
            this.conversationHistory.push(
                ...history.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
                    content: msg.content,
                }))
            );
        }
    }

    /**
     * Send message and get response
     */
    async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
        if (this.conversationHistory.length === 0) {
            await this.initializeChat(context);
        }

        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: message,
            });

            // Call OpenAI API
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: this.conversationHistory,
                temperature: 0.7,
                max_tokens: 2000,
            });

            const responseMessage = completion.choices[0].message;
            const text = responseMessage.content || 'Ne pare rău, nu am putut genera un răspuns.';

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: text,
            });

            return {
                message: text,
                toolCalls: [],
                metadata: {
                    model: 'gpt-4o-mini',
                    timestamp: new Date(),
                    usage: completion.usage,
                },
            };
        } catch (error: any) {
            console.error('OpenAI API error:', error);
            throw new Error(`Failed to get response from AI assistant: ${error.message}`);
        }
    }

    /**
     * Build comprehensive system prompt
     */
    private buildSystemPrompt(context: ChatContext): string {
        return `Tu ești Asistentul AI Principal al platformei CortexBuild (fostă ConstructAI), un sistem avansat de management pentru construcții.

**IDENTITATE & ROL:**
- Nume: CortexBuild Assistant
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
2. **Informații**: Oferă informații despre platforma CortexBuild și funcționalitățile sale
3. **Ghidare**: Ajută utilizatorii să navigheze și să folosească platforma eficient
4. **Suport**: Răspunde la întrebări despre proiecte, clienți, facturi, și alte funcționalități
5. **Context-Aware**: Înțelegi contextul paginii și conversației

**DATE DISPONIBILE:**
${this.formatAvailableData(context.availableData)}

**FUNCȚIONALITĂȚI PLATFORMĂ CORTEXBUILD:**

**Pentru Developer Users:**
- 🛠️ SDK Developer Platform cu builder de module AI
- 🤖 AI Agents și Automation Studio
- 🧪 Sandbox pentru testare cod
- 🔧 Workflow Builder
- 📦 Community Marketplace cu module reutilizabile
- 🎯 System Analytics și metrici în timp real

**Pentru Company Admin:**
- 📊 Dashboard cu KPI-uri financiare și operaționale
- 💼 Management proiecte și clienți
- 💰 Facturare și tracking financiar
- 👥 Team management și roluri
- 📈 Rapoarte și analytics

**Pentru Project Managers:**
- 🏗️ Planificare și tracking proiecte
- 📋 Task management
- 💵 Budget tracking
- 📄 RFIs și document management
- 👷 Team coordination

**Pentru Super Admin:**
- 🌐 Platform-wide management
- 🏢 Multi-tenant administration
- 👥 User și company management
- 🔐 Security și permissions
- 📊 Analytics cross-tenant

**REGULI IMPORTANTE:**
1. ✅ Răspunde ÎNTOTDEAUNA în limba română
2. ✅ Fii prietenos și profesional
3. ✅ Oferă răspunsuri clare și structurate
4. ✅ Folosește emoji-uri relevante pentru claritate
5. ✅ Dacă nu știi ceva, spune-o cinstit
6. ✅ Sugerează acțiuni când e relevant
7. ❌ NU inventa date sau funcționalități inexistente
8. ❌ NU accesa sau menționa date din alte companii

**STIL DE COMUNICARE:**
- Prietenos și profesional
- Concis dar complet
- Folosește emoji-uri relevant (📊 📈 💰 🏗️ ✅ ⚠️ 🤖 🛠️)
- Structurează răspunsurile cu bullet points când e relevant
- Oferă exemple concrete când sunt utile

**EXEMPLE DE INTERACȚIUNI:**

User: "Cum pot crea un proiect nou?"
Tu: "🏗️ Pentru a crea un proiect nou, urmează acești pași:

1. Click pe butonul **'+ Proiect Nou'** din dashboard
2. Completează detaliile:
   - Nume proiect
   - Locație
   - Client (selectează din listă sau creează unul nou)
   - Buget estimat
   - Date de început și finalizare
3. Click **'Salvează'**

✅ Proiectul va apărea imediat în lista ta de proiecte active!"

User: "Ce pot face cu SDK Developer Platform?"
Tu: "🛠️ SDK Developer Platform îți oferă:

**🤖 AI Builder:** Creează module cu AI (OpenAI sau Gemini)
**🔧 Workflow Automation:** Automatizează task-uri repetitive
**🧪 Sandbox Testing:** Testează cod în siguranță
**📦 Marketplace:** Distribuie și monetizează module
**📊 Analytics:** Monitorizează performanța modulelor tale

Vrei să explorez una dintre aceste funcționalități împreună? 😊"

User: "Cum văd statusul financiar?"
Tu: "💰 Pentru statusul financiar:

**Din Dashboard:**
- Vezi widget-ul **'Financial Overview'** pentru:
  - Total venituri
  - Cheltuieli curente
  - Profit net
  - Facturi pending

**Pentru detalii:**
- Click pe secțiunea **'Financiar'** din meniu
- Ai acces la:
  📊 Rapoarte detaliate
  📈 Grafice trend
  💳 Istoric facturi
  💵 Budget tracking pe proiect

Te ajut cu ceva specific legat de finanțe? 📊"

Răspunde acum la întrebarea utilizatorului în mod natural și util!`;
    }

    /**
     * Format available data for system prompt
     */
    private formatAvailableData(data?: Record<string, any>): string {
        if (!data || Object.keys(data).length === 0) {
            return 'Nu sunt date încărcate momentan.';
        }

        const sections: string[] = [];

        if (data.projects?.length > 0) {
            sections.push(`📊 ${data.projects.length} proiecte disponibile`);
        }

        if (data.clients?.length > 0) {
            sections.push(`👥 ${data.clients.length} clienți`);
        }

        if (data.invoices?.length > 0) {
            sections.push(`💰 ${data.invoices.length} facturi`);
        }

        return sections.join('\n') || 'Date disponibile în sistem.';
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }
}
