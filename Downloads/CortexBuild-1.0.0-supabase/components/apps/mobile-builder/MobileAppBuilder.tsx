/**
 * Mobile App Builder - Create custom mobile applications
 * 
 * Features:
 * - 3 Database Options (Free Built-in, Company DB, Custom)
 * - Visual UI Builder
 * - Code Editor
 * - Preview & Testing
 * - Publish to Marketplace
 * - Download Standalone
 */

import React, { useState } from 'react';
import {
    Smartphone,
    Database,
    Code,
    Eye,
    Download,
    Upload,
    Settings,
    Layers,
    Zap,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseConfig from './DatabaseConfig';
import UIBuilder from './UIBuilder';
import LogicEditor from './LogicEditor';
import AppPreview from './AppPreview';
import PublishApp from './PublishApp';

interface MobileAppBuilderProps {
    isDarkMode?: boolean;
}

type DatabaseOption = 'free' | 'company' | 'custom';
type BuilderStep = 'info' | 'database' | 'ui' | 'logic' | 'preview' | 'publish';

interface AppProject {
    id: string;
    name: string;
    description: string;
    icon: string;
    databaseType: DatabaseOption;
    databaseConfig: any;
    screens: any[];
    logic: string;
    createdAt: Date;
}

const MobileAppBuilder: React.FC<MobileAppBuilderProps> = ({ isDarkMode = true }) => {
    const [currentStep, setCurrentStep] = useState<BuilderStep>('info');
    const [projects, setProjects] = useState<AppProject[]>([]);
    const [currentProject, setCurrentProject] = useState<AppProject | null>(null);

    // App Info State
    const [appName, setAppName] = useState('');
    const [appDescription, setAppDescription] = useState('');
    const [appIcon, setAppIcon] = useState('📱');

    // Database State
    const [selectedDatabase, setSelectedDatabase] = useState<DatabaseOption>('free');
    const [databaseConfig, setDatabaseConfig] = useState<any>({});

    const steps: { id: BuilderStep; name: string; icon: any }[] = [
        { id: 'info', name: 'App Info', icon: Smartphone },
        { id: 'database', name: 'Database', icon: Database },
        { id: 'ui', name: 'UI Builder', icon: Layers },
        { id: 'logic', name: 'Logic', icon: Code },
        { id: 'preview', name: 'Preview', icon: Eye },
        { id: 'publish', name: 'Publish', icon: Upload }
    ];

    const databaseOptions = [
        {
            id: 'free' as DatabaseOption,
            name: 'Free Built-in Database',
            description: 'Zero configuration - Ready to use immediately',
            icon: '🎁',
            color: 'from-green-600 to-emerald-600',
            features: [
                'Pre-configured Supabase database',
                'Automatic provisioning',
                'Basic CRUD operations',
                'Perfect for prototyping'
            ]
        },
        {
            id: 'company' as DatabaseOption,
            name: 'Company Database',
            description: 'Connect to your existing company database',
            icon: '🏢',
            color: 'from-blue-600 to-cyan-600',
            features: [
                'Extend existing infrastructure',
                'Data synchronization',
                'Company security policies',
                'Integration with current systems'
            ]
        },
        {
            id: 'custom' as DatabaseOption,
            name: 'Custom Database',
            description: 'Configure your own database connection',
            icon: '⚙️',
            color: 'from-purple-600 to-pink-600',
            features: [
                'API endpoints & credentials',
                'MCP connections',
                'Multiple database types',
                'Full customization'
            ]
        }
    ];

    const createNewProject = () => {
        if (!appName.trim()) {
            toast.error('Please enter an app name');
            return;
        }

        const newProject: AppProject = {
            id: Date.now().toString(),
            name: appName,
            description: appDescription,
            icon: appIcon,
            databaseType: selectedDatabase,
            databaseConfig: databaseConfig,
            screens: [],
            logic: '',
            createdAt: new Date()
        };

        setProjects([...projects, newProject]);
        setCurrentProject(newProject);
        toast.success('Project created!');
    };

    const nextStep = () => {
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const prevStep = () => {
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1].id);
        }
    };

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <div className={`min-h-full ${bgClass} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${textClass}`}>
                        📱 Mobile App Builder
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Create custom mobile applications with flexible database options
                    </p>
                </div>

                {/* Progress Steps */}
                <div className={`p-6 rounded-2xl border ${cardClass} mb-8`}>
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isActive
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-110'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                        </div>
                                        <span className={`text-sm font-medium ${isActive ? textClass : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-4 rounded ${isCompleted ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className={`p-8 rounded-2xl border ${cardClass} min-h-[500px]`}>
                    {/* Step 1: App Info */}
                    {currentStep === 'info' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className={`text-3xl font-bold mb-6 ${textClass}`}>App Information</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                                        App Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        placeholder="My Construction App"
                                        className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                                            ? 'bg-gray-700 text-white border-gray-600'
                                            : 'bg-white text-gray-900 border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                                        Description
                                    </label>
                                    <textarea
                                        value={appDescription}
                                        onChange={(e) => setAppDescription(e.target.value)}
                                        placeholder="Describe what your app does..."
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-xl border resize-none ${isDarkMode
                                            ? 'bg-gray-700 text-white border-gray-600'
                                            : 'bg-white text-gray-900 border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                                        App Icon
                                    </label>
                                    <div className="flex gap-2">
                                        {['📱', '🏗️', '📊', '⚡', '🎯', '🔧', '📦', '✅'].map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setAppIcon(icon)}
                                                className={`w-16 h-16 rounded-xl text-3xl flex items-center justify-center transition-all ${appIcon === icon
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 scale-110'
                                                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Database Selection */}
                    {currentStep === 'database' && (
                        <div>
                            <h2 className={`text-3xl font-bold mb-6 ${textClass}`}>Choose Database Option</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {databaseOptions.map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSelectedDatabase(option.id)}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedDatabase === option.id
                                            ? `border-purple-500 bg-gradient-to-br ${option.color} text-white`
                                            : isDarkMode
                                                ? 'border-gray-700 bg-gray-700 hover:border-gray-600'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-5xl mb-4">{option.icon}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${selectedDatabase === option.id ? 'text-white' : textClass
                                            }`}>
                                            {option.name}
                                        </h3>
                                        <p className={`text-sm mb-4 ${selectedDatabase === option.id
                                            ? 'text-white/80'
                                            : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            {option.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {option.features.map((feature, index) => (
                                                <li key={index} className={`flex items-start gap-2 text-sm ${selectedDatabase === option.id
                                                    ? 'text-white/90'
                                                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                ))}
                            </div>

                            {/* Database Configuration */}
                            <div className="mt-8">
                                <DatabaseConfig
                                    databaseType={selectedDatabase}
                                    config={databaseConfig}
                                    onConfigChange={setDatabaseConfig}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: UI Builder */}
                    {currentStep === 'ui' && (
                        <div className="h-[600px]">
                            <UIBuilder isDarkMode={isDarkMode} />
                        </div>
                    )}

                    {/* Step 4: Logic Editor */}
                    {currentStep === 'logic' && (
                        <div className="h-[600px]">
                            <LogicEditor isDarkMode={isDarkMode} />
                        </div>
                    )}

                    {/* Step 5: Preview */}
                    {currentStep === 'preview' && (
                        <div className="h-[600px]">
                            <AppPreview
                                isDarkMode={isDarkMode}
                                appName={appName}
                                appIcon={appIcon}
                            />
                        </div>
                    )}

                    {/* Step 6: Publish */}
                    {currentStep === 'publish' && (
                        <div className="h-[600px] overflow-y-auto">
                            <PublishApp
                                isDarkMode={isDarkMode}
                                appName={appName}
                                appIcon={appIcon}
                                appDescription={appDescription}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 'info'}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${currentStep === 'info'
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            }`}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={currentStep === 'publish'}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${currentStep === 'publish'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                            }`}
                    >
                        Next
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileAppBuilder;

