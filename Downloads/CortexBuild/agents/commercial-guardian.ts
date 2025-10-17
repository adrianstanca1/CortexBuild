/**
 * Commercial Guardian AI Agent
 * Contract management, claims, and commercial risk
 */

import { BaseAgent } from './base-agent';

export class CommercialGuardianAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Commercial Guardian',
            model: 'claude-3-sonnet',
            temperature: 0.4,
            maxTokens: 2000,
            systemPrompt: `You are Commercial Guardian AI, an expert in construction contract management, claims, disputes, and commercial risk.

Your expertise includes:
- Contract interpretation and compliance
- Claims preparation and defense
- Dispute resolution strategies
- Commercial risk assessment
- Variation management
- Extension of time claims

You provide:
- Clear contract analysis
- Evidence-based recommendations
- Risk mitigation strategies
- Commercially sound advice

Always prioritize protecting the client's commercial interests while maintaining fairness.`,
        });
    }

    /**
     * Draft contract violation notice
     */
    async draftViolationNotice(violation: {
        contractorName: string;
        contractNumber: string;
        violationType: string;
        incidents: Array<{ date: string; description: string }>;
        contractClauses: string[];
    }): Promise<{
        notice: string;
        severity: 'minor' | 'major' | 'material';
        recommendedActions: string[];
        legalRisks: string[];
    }> {
        const prompt = `Draft a contract violation notice:

Contractor: ${violation.contractorName}
Contract Number: ${violation.contractNumber}
Violation Type: ${violation.violationType}
Incidents: ${JSON.stringify(violation.incidents, null, 2)}
Relevant Contract Clauses: ${violation.contractClauses.join(', ')}

Provide in JSON format with:
- notice: formal violation notice text
- severity: violation severity level
- recommendedActions: recommended next steps
- legalRisks: potential legal risks

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const notice = this.extractJSON(response.content);

        if (!notice || !this.validateResponse(notice, ['notice', 'severity'])) {
            throw new Error('Invalid response from Commercial Guardian');
        }

        return notice;
    }

    /**
     * Assess claim validity
     */
    async assessClaim(claim: {
        type: 'delay' | 'variation' | 'disruption' | 'acceleration';
        amount: number;
        basis: string;
        evidence: string[];
        contractProvisions: string[];
    }): Promise<{
        validity: 'strong' | 'moderate' | 'weak';
        likelihood: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    }> {
        const prompt = `Assess this construction claim:

Claim Type: ${claim.type}
Claimed Amount: £${claim.amount.toLocaleString()}
Basis: ${claim.basis}
Evidence: ${claim.evidence.join(', ')}
Contract Provisions: ${claim.contractProvisions.join(', ')}

Provide assessment in JSON format with:
- validity: claim validity assessment
- likelihood: success likelihood (0-1)
- strengths: claim strengths
- weaknesses: claim weaknesses
- recommendations: recommendations for claim

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const assessment = this.extractJSON(response.content);

        if (!assessment || !this.validateResponse(assessment, ['validity', 'likelihood'])) {
            throw new Error('Invalid response from Commercial Guardian');
        }

        return assessment;
    }

    /**
     * Analyze contract compliance
     */
    async analyzeCompliance(contractor: {
        name: string;
        contractType: string;
        performanceHistory: Array<{
            metric: string;
            target: number;
            actual: number;
        }>;
        violations: number;
    }): Promise<{
        complianceScore: number;
        status: 'compliant' | 'at_risk' | 'non_compliant';
        issues: string[];
        recommendations: string[];
    }> {
        const prompt = `Analyze contract compliance:

Contractor: ${contractor.name}
Contract Type: ${contractor.contractType}
Performance History: ${JSON.stringify(contractor.performanceHistory, null, 2)}
Violations: ${contractor.violations}

Provide compliance analysis in JSON format with:
- complianceScore: 0-100 score
- status: compliance status
- issues: compliance issues
- recommendations: improvement recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['complianceScore', 'status'])) {
            throw new Error('Invalid response from Commercial Guardian');
        }

        return analysis;
    }
}

