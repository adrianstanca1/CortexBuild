/**
 * ML Predictor Service for ConstructAI
 * Uses neural networks to predict project outcomes
 */

import {
    NeuralNetwork,
    ProjectMetrics,
    PredictionResult,
    normalizeMetrics,
    denormalizePrediction,
    calculateConfidence,
    analyzeFactors,
    TrainingData
} from './neuralNetwork';
import { Project, Task, RFI, PunchListItem } from '../types';

/**
 * Pre-trained model data (in production, this would be loaded from a database)
 */
const PRETRAINED_MODEL_DATA = {
    weights1: [
        [0.45, -0.32, 0.67, 0.21, -0.54, 0.38, 0.12, -0.29],
        [-0.23, 0.56, -0.41, 0.78, 0.15, -0.62, 0.34, 0.51],
        [0.67, -0.18, 0.42, -0.55, 0.71, 0.09, -0.47, 0.33],
        [-0.39, 0.64, -0.27, 0.48, -0.13, 0.59, 0.22, -0.44],
        [0.51, -0.45, 0.36, -0.68, 0.19, 0.42, -0.57, 0.28],
        [-0.14, 0.37, -0.61, 0.25, 0.53, -0.38, 0.46, -0.19],
        [0.29, -0.52, 0.44, 0.17, -0.35, 0.63, -0.21, 0.48]
    ],
    weights2: [
        [0.58, -0.42, 0.31],
        [-0.27, 0.65, -0.49],
        [0.43, -0.36, 0.72],
        [-0.51, 0.28, -0.15],
        [0.39, -0.63, 0.47],
        [-0.46, 0.54, -0.38],
        [0.62, -0.19, 0.41],
        [-0.33, 0.48, -0.56]
    ],
    bias1: [0.12, -0.34, 0.56, -0.21, 0.45, -0.38, 0.27, -0.49],
    bias2: [0.31, -0.42, 0.53],
    learningRate: 0.1
};

/**
 * ML Predictor class
 */
export class MLPredictor {
    private network: NeuralNetwork;
    private isInitialized: boolean = false;

    constructor() {
        // Initialize with pre-trained weights
        this.network = new NeuralNetwork(7, 8, 3, 0.1);
        this.loadPretrainedModel();
    }

    /**
     * Load pre-trained model
     */
    private loadPretrainedModel(): void {
        try {
            this.network = NeuralNetwork.deserialize(JSON.stringify(PRETRAINED_MODEL_DATA));
            this.isInitialized = true;
            console.log('✅ ML Predictor initialized with pre-trained model');
        } catch (error) {
            console.error('❌ Failed to load pre-trained model:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Extract metrics from project data
     */
    private extractMetrics(
        project: Project,
        tasks: Task[],
        rfis: RFI[],
        punchItems: PunchListItem[]
    ): ProjectMetrics {
        const now = new Date();
        const startDate = project.startDate ? new Date(project.startDate) : now;
        const endDate = project.endDate ? new Date(project.endDate) : now;

        const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const openRFIs = rfis.filter(r => r.status === 'Open').length;
        const openPunchItems = punchItems.filter(p => p.status === 'Open').length;

        return {
            budget: project.budget || 0,
            spent: project.spent || 0,
            daysElapsed,
            totalDays,
            tasksCompleted: completedTasks,
            totalTasks: tasks.length || 1,
            openRFIs,
            openPunchItems,
            teamSize: 10, // This would come from actual team data
            weatherDelays: 0, // This would come from daily logs
        };
    }

    /**
     * Predict project outcomes
     */
    async predictProjectOutcome(
        project: Project,
        tasks: Task[],
        rfis: RFI[],
        punchItems: PunchListItem[]
    ): Promise<PredictionResult> {
        if (!this.isInitialized) {
            throw new Error('ML Predictor not initialized');
        }

        // Extract and normalize metrics
        const metrics = this.extractMetrics(project, tasks, rfis, punchItems);
        const normalizedInput = normalizeMetrics(metrics);

        // Make prediction
        const rawOutput = this.network.predict(normalizedInput);
        const prediction = denormalizePrediction(rawOutput);

        // Calculate confidence and analyze factors
        const confidence = calculateConfidence(metrics);
        const factors = analyzeFactors(metrics);

        return {
            prediction: [
                prediction.budgetOverrun,
                prediction.delayDays,
                prediction.riskScore
            ],
            confidence,
            factors
        };
    }

    /**
     * Train the model with new data (for continuous learning)
     */
    async trainWithNewData(trainingData: TrainingData, epochs: number = 100): Promise<void> {
        console.log('🧠 Training neural network with new data...');
        this.network.train(trainingData, epochs);
        console.log('✅ Training complete');
    }

    /**
     * Get model performance metrics
     */
    getModelInfo(): {
        isInitialized: boolean;
        inputSize: number;
        hiddenSize: number;
        outputSize: number;
    } {
        return {
            isInitialized: this.isInitialized,
            inputSize: 7,
            hiddenSize: 8,
            outputSize: 3
        };
    }

    /**
     * Generate training data from historical projects
     */
    static generateTrainingData(
        historicalProjects: Array<{
            project: Project;
            tasks: Task[];
            rfis: RFI[];
            punchItems: PunchListItem[];
            actualOverrun: number;
            actualDelay: number;
            actualRisk: number;
        }>
    ): TrainingData {
        const inputs: number[][] = [];
        const outputs: number[][] = [];

        for (const data of historicalProjects) {
            const predictor = new MLPredictor();
            const metrics = predictor.extractMetrics(
                data.project,
                data.tasks,
                data.rfis,
                data.punchItems
            );

            inputs.push(normalizeMetrics(metrics));
            outputs.push([
                data.actualOverrun / 100,
                data.actualDelay / 90,
                data.actualRisk / 100
            ]);
        }

        return { inputs, outputs };
    }
}

/**
 * Singleton instance
 */
let predictorInstance: MLPredictor | null = null;

/**
 * Get ML Predictor instance
 */
export function getMLPredictor(): MLPredictor {
    if (!predictorInstance) {
        predictorInstance = new MLPredictor();
    }
    return predictorInstance;
}

/**
 * Format prediction for display
 */
export function formatPrediction(result: PredictionResult): {
    budgetStatus: string;
    timelineStatus: string;
    riskLevel: string;
    budgetColor: string;
    timelineColor: string;
    riskColor: string;
} {
    const [budgetOverrun, delayDays, riskScore] = result.prediction;

    return {
        budgetStatus: budgetOverrun > 10
            ? `${budgetOverrun.toFixed(1)}% over budget`
            : budgetOverrun < -5
            ? `${Math.abs(budgetOverrun).toFixed(1)}% under budget`
            : 'On budget',
        timelineStatus: delayDays > 7
            ? `${Math.floor(delayDays)} days delayed`
            : delayDays < -3
            ? `${Math.floor(Math.abs(delayDays))} days ahead`
            : 'On schedule',
        riskLevel: riskScore > 70
            ? 'High Risk'
            : riskScore > 40
            ? 'Medium Risk'
            : 'Low Risk',
        budgetColor: budgetOverrun > 10
            ? 'text-red-600'
            : budgetOverrun < -5
            ? 'text-green-600'
            : 'text-yellow-600',
        timelineColor: delayDays > 7
            ? 'text-red-600'
            : delayDays < -3
            ? 'text-green-600'
            : 'text-yellow-600',
        riskColor: riskScore > 70
            ? 'text-red-600'
            : riskScore > 40
            ? 'text-yellow-600'
            : 'text-green-600'
    };
}

