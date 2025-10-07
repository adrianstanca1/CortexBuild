import React, { useState, useEffect, useCallback } from 'react';
import { AIAgent, NeuralCommand, neuralNetworkService } from '../services/neuralNetworkService';
import { FiCpu, FiTerminal, FiActivity, FiRefreshCw } from 'react-icons/fi';

const NeuralNetworkModule: React.FC = () => {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [commands, setCommands] = useState<NeuralCommand[]>([]);
    const [networkStats, setNetworkStats] = useState<any>(null);
    const [commandHistory, setCommandHistory] = useState<NeuralCommand[]>([]);
    const [isExecuting, setIsExecuting] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setAgents(neuralNetworkService.getAgents());
        setCommands(neuralNetworkService.getPredefinedCommands());
        setNetworkStats(neuralNetworkService.getNetworkStats());
        setCommandHistory(neuralNetworkService.getCommandHistory());
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleExecuteCommand = async (command: NeuralCommand) => {
        setIsExecuting(command.id);
        try {
            await neuralNetworkService.executeCommand(command);
            fetchData();
        } catch (error) {
            console.error("Error executing command:", error);
        }
        setTimeout(() => setIsExecuting(null), 2000);
    };
    
    const handleResetNetwork = () => {
        neuralNetworkService.resetNetwork();
        fetchData();
    };

    const getStatusColor = (status: AIAgent['status']) => {
        switch (status) {
            case 'active': return 'bg-blue-500';
            case 'processing': return 'bg-yellow-400';
            case 'complete': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const getPriorityColor = (priority: NeuralCommand['priority']) => {
        switch (priority) {
            case 'critical': return 'border-red-500';
            case 'high': return 'border-orange-400';
            case 'medium': return 'border-blue-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents Column */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                    <FiCpu className="w-6 h-6 mr-3 text-blue-600"/>
                    <h2 className="text-xl font-bold">AI Agents</h2>
                </div>
                <div className="space-y-3">
                    {agents.map(agent => (
                        <div key={agent.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-md">{agent.name}</h3>
                                <div className={`w-3.5 h-3.5 rounded-full ${getStatusColor(agent.status)} transition-colors duration-500`}></div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 h-10">{agent.lastAction}</p>
                            <div className="flex items-center justify-between text-xs font-mono bg-gray-100 p-2 rounded-md">
                                <span>CONF: {agent.confidence.toFixed(1)}%</span>
                                <span className="font-semibold uppercase">{agent.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commands Column */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                    <FiTerminal className="w-6 h-6 mr-3 text-green-600"/>
                    <h2 className="text-xl font-bold">Neural Commands</h2>
                </div>
                <div className="space-y-3">
                    {commands.map(command => (
                        <div key={command.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(command.priority)} bg-white hover:bg-gray-50 transition-colors duration-200`}>
                            <h3 className="font-bold text-md">{command.description}</h3>
                            <p className="text-xs text-gray-500 mt-1">Targets: {command.target.join(', ')}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md bg-gray-100`}>{command.priority}</span>
                                <button 
                                    onClick={() => handleExecuteCommand(command)}
                                    disabled={isExecuting !== null}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:bg-gray-400 transition-all duration-300 flex items-center">
                                    {isExecuting === command.id ? 'Executing...' : 'Execute'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights Column */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <FiActivity className="w-6 h-6 mr-3 text-purple-600"/>
                        <h2 className="text-xl font-bold">Neural Insights</h2>
                    </div>
                    <button onClick={handleResetNetwork} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <FiRefreshCw className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                {networkStats && (
                    <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Health</p>
                            <p className="text-2xl font-bold text-green-600">{networkStats.networkHealth.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold">{networkStats.activeAgents}/{networkStats.totalAgents}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-2xl font-bold">{networkStats.averageConfidence.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Operations</p>
                            <p className="text-2xl font-bold">{networkStats.totalOperations}</p>
                        </div>
                    </div>
                )}
                <h3 className="text-md font-bold mb-2">Command History</h3>
                <div className="space-y-2 text-sm h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {commandHistory.length === 0 && <p className='text-gray-500 text-center mt-10'>No commands executed yet.</p>}
                    {commandHistory.slice().reverse().map((cmd, index) => (
                        <div key={index} className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
                           <p className='font-semibold text-xs'>{cmd.description}</p>
                           <p className='text-xs text-gray-500 mt-1'>Status: <span class="font-semibold text-green-600">Completed</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NeuralNetworkModule;