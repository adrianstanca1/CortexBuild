/**
 * Neural Network Module for ConstructAI
 * Provides ML-powered predictions for construction projects
 */

export interface TrainingData {
    inputs: number[][];
    outputs: number[][];
}

export interface PredictionResult {
    prediction: number[];
    confidence: number;
    factors: { name: string; impact: number }[];
}

export interface ProjectMetrics {
    budget: number;
    spent: number;
    daysElapsed: number;
    totalDays: number;
    tasksCompleted: number;
    totalTasks: number;
    openRFIs: number;
    openPunchItems: number;
    teamSize: number;
    weatherDelays: number;
}

/**
 * Simple Neural Network implementation using backpropagation
 */
export class NeuralNetwork {
    private weights1: number[][];
    private weights2: number[][];
    private bias1: number[];
    private bias2: number[];
    private learningRate: number;

    constructor(
        inputSize: number,
        hiddenSize: number,
        outputSize: number,
        learningRate: number = 0.1
    ) {
        this.learningRate = learningRate;

        // Initialize weights with random values
        this.weights1 = this.randomMatrix(inputSize, hiddenSize);
        this.weights2 = this.randomMatrix(hiddenSize, outputSize);
        this.bias1 = this.randomArray(hiddenSize);
        this.bias2 = this.randomArray(outputSize);
    }

    private randomMatrix(rows: number, cols: number): number[][] {
        return Array(rows).fill(0).map(() =>
            Array(cols).fill(0).map(() => Math.random() * 2 - 1)
        );
    }

    private randomArray(size: number): number[] {
        return Array(size).fill(0).map(() => Math.random() * 2 - 1);
    }

    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    private sigmoidDerivative(x: number): number {
        return x * (1 - x);
    }

    private matrixMultiply(a: number[], b: number[][]): number[] {
        return b[0].map((_, i) =>
            a.reduce((sum, val, j) => sum + val * b[j][i], 0)
        );
    }

    private addBias(a: number[], bias: number[]): number[] {
        return a.map((val, i) => val + bias[i]);
    }

    private applyActivation(a: number[]): number[] {
        return a.map(val => this.sigmoid(val));
    }

    /**
     * Forward propagation
     */
    predict(input: number[]): number[] {
        // Hidden layer
        const hidden = this.applyActivation(
            this.addBias(this.matrixMultiply(input, this.weights1), this.bias1)
        );

        // Output layer
        const output = this.applyActivation(
            this.addBias(this.matrixMultiply(hidden, this.weights2), this.bias2)
        );

        return output;
    }

    /**
     * Train the network with backpropagation
     */
    train(data: TrainingData, epochs: number = 1000): void {
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (let i = 0; i < data.inputs.length; i++) {
                const input = data.inputs[i];
                const target = data.outputs[i];

                // Forward pass
                const hidden = this.applyActivation(
                    this.addBias(this.matrixMultiply(input, this.weights1), this.bias1)
                );
                const output = this.applyActivation(
                    this.addBias(this.matrixMultiply(hidden, this.weights2), this.bias2)
                );

                // Calculate output error
                const outputError = target.map((t, j) => t - output[j]);
                const outputDelta = outputError.map((e, j) =>
                    e * this.sigmoidDerivative(output[j])
                );

                // Calculate hidden error
                const hiddenError = hidden.map((_, j) =>
                    outputDelta.reduce((sum, delta, k) =>
                        sum + delta * this.weights2[j][k], 0
                    )
                );
                const hiddenDelta = hiddenError.map((e, j) =>
                    e * this.sigmoidDerivative(hidden[j])
                );

                // Update weights and biases
                for (let j = 0; j < this.weights2.length; j++) {
                    for (let k = 0; k < this.weights2[j].length; k++) {
                        this.weights2[j][k] += this.learningRate * outputDelta[k] * hidden[j];
                    }
                }

                for (let j = 0; j < this.weights1.length; j++) {
                    for (let k = 0; k < this.weights1[j].length; k++) {
                        this.weights1[j][k] += this.learningRate * hiddenDelta[k] * input[j];
                    }
                }

                this.bias2 = this.bias2.map((b, j) => b + this.learningRate * outputDelta[j]);
                this.bias1 = this.bias1.map((b, j) => b + this.learningRate * hiddenDelta[j]);
            }
        }
    }

    /**
     * Serialize the network for storage
     */
    serialize(): string {
        return JSON.stringify({
            weights1: this.weights1,
            weights2: this.weights2,
            bias1: this.bias1,
            bias2: this.bias2,
            learningRate: this.learningRate
        });
    }

    /**
     * Deserialize and load a saved network
     */
    static deserialize(data: string): NeuralNetwork {
        const parsed = JSON.parse(data);
        const nn = new NeuralNetwork(
            parsed.weights1.length,
            parsed.weights1[0].length,
            parsed.weights2[0].length,
            parsed.learningRate
        );
        nn.weights1 = parsed.weights1;
        nn.weights2 = parsed.weights2;
        nn.bias1 = parsed.bias1;
        nn.bias2 = parsed.bias2;
        return nn;
    }
}

/**
 * Normalize project metrics to 0-1 range for neural network input
 */
export function normalizeMetrics(metrics: ProjectMetrics): number[] {
    return [
        metrics.spent / (metrics.budget || 1), // Budget utilization
        metrics.daysElapsed / (metrics.totalDays || 1), // Time progress
        metrics.tasksCompleted / (metrics.totalTasks || 1), // Task completion
        metrics.openRFIs / 50, // Normalized RFI count (assuming max 50)
        metrics.openPunchItems / 100, // Normalized punch items (assuming max 100)
        metrics.teamSize / 50, // Normalized team size (assuming max 50)
        metrics.weatherDelays / 30, // Normalized weather delays (assuming max 30 days)
    ];
}

/**
 * Denormalize prediction output
 */
export function denormalizePrediction(output: number[]): {
    budgetOverrun: number;
    delayDays: number;
    riskScore: number;
} {
    return {
        budgetOverrun: output[0] * 100, // Percentage over budget
        delayDays: output[1] * 90, // Days of delay (max 90)
        riskScore: output[2] * 100, // Risk score 0-100
    };
}

/**
 * Calculate prediction confidence based on data quality
 */
export function calculateConfidence(metrics: ProjectMetrics): number {
    let confidence = 100;

    // Reduce confidence if data is incomplete
    if (metrics.budget === 0) confidence -= 20;
    if (metrics.totalTasks === 0) confidence -= 20;
    if (metrics.totalDays === 0) confidence -= 20;
    if (metrics.teamSize === 0) confidence -= 10;

    // Reduce confidence for early-stage projects
    const progress = metrics.daysElapsed / (metrics.totalDays || 1);
    if (progress < 0.1) confidence -= 30;
    else if (progress < 0.3) confidence -= 15;

    return Math.max(0, Math.min(100, confidence));
}

/**
 * Analyze which factors contribute most to the prediction
 */
export function analyzeFactors(metrics: ProjectMetrics): { name: string; impact: number }[] {
    const factors = [
        {
            name: 'Budget Utilization',
            impact: Math.abs((metrics.spent / (metrics.budget || 1)) - (metrics.daysElapsed / (metrics.totalDays || 1))) * 100
        },
        {
            name: 'Task Completion Rate',
            impact: Math.abs((metrics.tasksCompleted / (metrics.totalTasks || 1)) - (metrics.daysElapsed / (metrics.totalDays || 1))) * 100
        },
        {
            name: 'Open Issues',
            impact: (metrics.openRFIs + metrics.openPunchItems) * 2
        },
        {
            name: 'Team Capacity',
            impact: Math.max(0, 50 - metrics.teamSize * 2)
        },
        {
            name: 'Weather Impact',
            impact: metrics.weatherDelays * 3
        }
    ];

    return factors.sort((a, b) => b.impact - a.impact);
}

