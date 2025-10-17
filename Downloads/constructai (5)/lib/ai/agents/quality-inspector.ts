/**
 * Quality Inspector AI Agent
 * Quality control, defect analysis, and standards compliance
 */

import { BaseAgent } from './base-agent';

export class QualityInspectorAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Quality Inspector',
            model: 'gpt-4-turbo',
            temperature: 0.3,
            maxTokens: 2000,
            systemPrompt: `You are Quality Inspector AI, an expert in construction quality control, defect analysis, and standards compliance.

Your expertise includes:
- Quality standards and specifications
- Defect identification and classification
- Inspection protocols
- Remediation strategies
- Material testing and certification
- Quality assurance processes

You provide:
- Detailed quality assessments
- Clear defect classifications
- Practical remediation plans
- Standards compliance verification

Always prioritize quality and safety while being practical and cost-effective.`,
        });
    }

    /**
     * Analyze quality defect
     */
    async analyzeDefect(defect: {
        location: string;
        type: string;
        description: string;
        photos?: string[];
        standard: string;
    }): Promise<{
        severity: 'minor' | 'major' | 'critical';
        classification: string;
        rootCause: string;
        remediation: {
            method: string;
            cost: { min: number; max: number };
            duration: string;
            materials: string[];
        };
        preventiveMeasures: string[];
    }> {
        const prompt = `Analyze this quality defect:

Location: ${defect.location}
Type: ${defect.type}
Description: ${defect.description}
Applicable Standard: ${defect.standard}

Provide defect analysis in JSON format with:
- severity: defect severity level
- classification: defect classification
- rootCause: likely root cause
- remediation: remediation plan with method, cost range, duration, materials
- preventiveMeasures: preventive measures

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['severity', 'classification', 'remediation'])) {
            throw new Error('Invalid response from Quality Inspector');
        }

        return analysis;
    }

    /**
     * Assess quality compliance
     */
    async assessCompliance(inspection: {
        area: string;
        standard: string;
        checkpoints: Array<{
            item: string;
            requirement: string;
            status: 'pass' | 'fail' | 'na';
        }>;
    }): Promise<{
        complianceScore: number;
        status: 'compliant' | 'minor_issues' | 'major_issues';
        failures: string[];
        recommendations: string[];
        nextInspection: string;
    }> {
        const prompt = `Assess quality compliance:

Area: ${inspection.area}
Standard: ${inspection.standard}
Checkpoints: ${JSON.stringify(inspection.checkpoints, null, 2)}

Provide compliance assessment in JSON format with:
- complianceScore: 0-100 score
- status: compliance status
- failures: failed checkpoints
- recommendations: improvement recommendations
- nextInspection: recommended next inspection date

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const assessment = this.extractJSON(response.content);

        if (!assessment || !this.validateResponse(assessment, ['complianceScore', 'status'])) {
            throw new Error('Invalid response from Quality Inspector');
        }

        return assessment;
    }

    /**
     * Generate inspection checklist
     */
    async generateChecklist(activity: {
        name: string;
        standard: string;
        materials: string[];
        criticalPoints: string[];
    }): Promise<{
        checklist: Array<{
            category: string;
            items: Array<{
                description: string;
                acceptance: string;
                method: string;
            }>;
        }>;
        frequency: string;
        documentation: string[];
    }> {
        const prompt = `Generate quality inspection checklist:

Activity: ${activity.name}
Standard: ${activity.standard}
Materials: ${activity.materials.join(', ')}
Critical Points: ${activity.criticalPoints.join(', ')}

Provide checklist in JSON format with:
- checklist: array of categories with inspection items
- frequency: recommended inspection frequency
- documentation: required documentation

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const checklist = this.extractJSON(response.content);

        if (!checklist || !this.validateResponse(checklist, ['checklist', 'frequency'])) {
            throw new Error('Invalid response from Quality Inspector');
        }

        return checklist;
    }
}

