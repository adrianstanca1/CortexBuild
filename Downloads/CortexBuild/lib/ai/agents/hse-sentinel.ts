/**
 * HSE Sentinel AI Agent
 * Health, Safety & Environment monitoring and compliance
 */

import { BaseAgent, type AgentResponse } from './base-agent';

export class HSESentinelAgent extends BaseAgent {
    constructor() {
        super({
            name: 'HSE Sentinel',
            model: 'gpt-4-turbo',
            temperature: 0.3, // Lower temperature for safety-critical analysis
            maxTokens: 2000,
            systemPrompt: `You are HSE Sentinel, an expert AI agent specializing in construction site health, safety, and environmental compliance.

Your responsibilities:
- Analyze safety incidents and violations
- Identify hazards and risks
- Recommend corrective actions
- Ensure regulatory compliance
- Monitor safety trends

You provide:
- Clear, actionable safety recommendations
- Risk assessments with severity levels
- Compliance status reports
- Incident root cause analysis

Always prioritize worker safety and regulatory compliance. Be direct and specific in your recommendations.`,
        });
    }

    /**
     * Analyze a safety incident
     */
    async analyzeIncident(incident: {
        type: string;
        location: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        photos?: string[];
    }): Promise<{
        riskLevel: string;
        immediateActions: string[];
        rootCause: string;
        preventiveMeasures: string[];
        complianceIssues: string[];
    }> {
        const prompt = `Analyze this safety incident:

Type: ${incident.type}
Location: ${incident.location}
Severity: ${incident.severity}
Description: ${incident.description}

Provide a comprehensive analysis in JSON format with:
- riskLevel: overall risk assessment
- immediateActions: list of immediate actions required
- rootCause: likely root cause of the incident
- preventiveMeasures: preventive measures to avoid recurrence
- complianceIssues: any regulatory compliance issues

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['riskLevel', 'immediateActions', 'rootCause'])) {
            throw new Error('Invalid response from HSE Sentinel');
        }

        return analysis;
    }

    /**
     * Assess safety compliance
     */
    async assessCompliance(site: {
        name: string;
        activities: string[];
        recentIncidents: number;
        lastInspection: string;
    }): Promise<{
        complianceScore: number;
        violations: string[];
        recommendations: string[];
        nextInspectionDate: string;
    }> {
        const prompt = `Assess safety compliance for this construction site:

Site: ${site.name}
Current Activities: ${site.activities.join(', ')}
Recent Incidents (30 days): ${site.recentIncidents}
Last Inspection: ${site.lastInspection}

Provide compliance assessment in JSON format with:
- complianceScore: 0-100 score
- violations: list of current violations
- recommendations: improvement recommendations
- nextInspectionDate: recommended next inspection date (YYYY-MM-DD)

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const assessment = this.extractJSON(response.content);

        if (!assessment || !this.validateResponse(assessment, ['complianceScore', 'violations'])) {
            throw new Error('Invalid response from HSE Sentinel');
        }

        return assessment;
    }

    /**
     * Generate safety briefing
     */
    async generateSafetyBriefing(activity: {
        name: string;
        location: string;
        hazards: string[];
        equipment: string[];
        workers: number;
    }): Promise<{
        briefing: string;
        keyPoints: string[];
        ppe_required: string[];
        emergencyProcedures: string[];
    }> {
        const prompt = `Generate a safety briefing for this activity:

Activity: ${activity.name}
Location: ${activity.location}
Known Hazards: ${activity.hazards.join(', ')}
Equipment: ${activity.equipment.join(', ')}
Number of Workers: ${activity.workers}

Provide safety briefing in JSON format with:
- briefing: comprehensive safety briefing text
- keyPoints: list of key safety points
- ppe_required: required personal protective equipment
- emergencyProcedures: emergency procedures

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const briefing = this.extractJSON(response.content);

        if (!briefing || !this.validateResponse(briefing, ['briefing', 'keyPoints', 'ppe_required'])) {
            throw new Error('Invalid response from HSE Sentinel');
        }

        return briefing;
    }
}

