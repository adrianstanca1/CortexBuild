/**
 * Financial Forecaster AI Agent
 * Budget forecasting, cash flow analysis, and financial risk assessment
 */

import { BaseAgent } from './base-agent';

export class FinancialForecasterAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Financial Forecaster',
            model: 'gpt-4-turbo',
            temperature: 0.3, // Lower temperature for financial accuracy
            maxTokens: 2000,
            systemPrompt: `You are Financial Forecaster AI, an expert in construction project finance, budgeting, cash flow management, and financial risk assessment.

Your expertise includes:
- Budget forecasting and variance analysis
- Cash flow projections and management
- Cost-benefit analysis
- Financial risk identification
- Contract financial structures
- Payment terms and penalties

You provide:
- Accurate financial forecasts
- Data-driven recommendations
- Risk-adjusted projections
- Clear explanations of financial metrics

Always base your analysis on sound financial principles and industry standards.`,
        });
    }

    /**
     * Forecast project budget at completion
     */
    async forecastBudget(project: {
        name: string;
        budget: number;
        spent: number;
        progress: number;
        remainingWork: number;
        historicalVariance: number;
    }): Promise<{
        estimateAtCompletion: number;
        varianceAtCompletion: number;
        confidenceLevel: number;
        riskFactors: string[];
        recommendations: string[];
    }> {
        const prompt = `Forecast the budget at completion for this project:

Project: ${project.name}
Original Budget: £${project.budget.toLocaleString()}
Spent to Date: £${project.spent.toLocaleString()}
Progress: ${project.progress}%
Remaining Work: ${project.remainingWork}%
Historical Variance: ${project.historicalVariance}%

Provide forecast in JSON format with:
- estimateAtCompletion: forecasted total cost
- varianceAtCompletion: expected variance from budget
- confidenceLevel: confidence in forecast (0-1)
- riskFactors: financial risk factors
- recommendations: cost control recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const forecast = this.extractJSON(response.content);

        if (!forecast || !this.validateResponse(forecast, ['estimateAtCompletion', 'varianceAtCompletion'])) {
            throw new Error('Invalid response from Financial Forecaster');
        }

        return forecast;
    }

    /**
     * Analyze cash flow
     */
    async analyzeCashFlow(data: {
        projectName: string;
        monthlyInflows: number[];
        monthlyOutflows: number[];
        currentBalance: number;
        creditLimit: number;
    }): Promise<{
        cashFlowHealth: 'healthy' | 'warning' | 'critical';
        projectedBalance: number[];
        shortfallMonths: number[];
        recommendations: string[];
    }> {
        const prompt = `Analyze cash flow for this project:

Project: ${data.projectName}
Current Balance: £${data.currentBalance.toLocaleString()}
Credit Limit: £${data.creditLimit.toLocaleString()}
Monthly Inflows: ${JSON.stringify(data.monthlyInflows)}
Monthly Outflows: ${JSON.stringify(data.monthlyOutflows)}

Provide cash flow analysis in JSON format with:
- cashFlowHealth: overall health status
- projectedBalance: projected balance for next 6 months
- shortfallMonths: months with potential shortfalls
- recommendations: cash flow improvement recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['cashFlowHealth', 'projectedBalance'])) {
            throw new Error('Invalid response from Financial Forecaster');
        }

        return analysis;
    }

    /**
     * Assess contract financial structure
     */
    async assessContract(contract: {
        type: 'fixed_price' | 'cost_plus' | 'time_and_materials';
        value: number;
        paymentTerms: string;
        penalties: string;
        incentives: string;
    }): Promise<{
        riskLevel: 'low' | 'medium' | 'high';
        financialExposure: number;
        recommendations: string[];
        opportunities: string[];
    }> {
        const prompt = `Assess this contract financial structure:

Contract Type: ${contract.type}
Contract Value: £${contract.value.toLocaleString()}
Payment Terms: ${contract.paymentTerms}
Penalties: ${contract.penalties}
Incentives: ${contract.incentives}

Provide assessment in JSON format with:
- riskLevel: financial risk level
- financialExposure: maximum financial exposure
- recommendations: risk mitigation recommendations
- opportunities: financial optimization opportunities

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const assessment = this.extractJSON(response.content);

        if (!assessment || !this.validateResponse(assessment, ['riskLevel', 'financialExposure'])) {
            throw new Error('Invalid response from Financial Forecaster');
        }

        return assessment;
    }
}

