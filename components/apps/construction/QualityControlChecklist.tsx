/**
 * Quality Control Checklist - Inspection forms and compliance tracking
 */

import React, { useState } from 'react';
import { CheckSquare, Camera, FileText, Download, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QualityControlChecklistProps {
    isDarkMode?: boolean;
}

interface ChecklistTemplate {
    id: string;
    name: string;
    category: string;
    items: ChecklistItem[];
}

interface ChecklistItem {
    id: string;
    description: string;
    status: 'pass' | 'fail' | 'na' | 'pending';
    notes: string;
    photos: string[];
    required: boolean;
}

interface Inspection {
    id: string;
    template: string;
    inspector: string;
    date: Date;
    location: string;
    status: 'in-progress' | 'completed' | 'failed';
    passRate: number;
}

const QualityControlChecklist: React.FC<QualityControlChecklistProps> = ({ isDarkMode = true }) => {
    const [templates] = useState<ChecklistTemplate[]>([
        {
            id: '1',
            name: 'Foundation Inspection',
            category: 'Structural',
            items: [
                { id: '1', description: 'Rebar placement and spacing', status: 'pass', notes: 'All specifications met', photos: [], required: true },
                { id: '2', description: 'Concrete mix quality', status: 'pass', notes: 'Test results within range', photos: [], required: true },
                { id: '3', description: 'Formwork alignment', status: 'pending', notes: '', photos: [], required: true },
                { id: '4', description: 'Drainage system', status: 'pending', notes: '', photos: [], required: false }
            ]
        },
        {
            id: '2',
            name: 'Electrical Safety',
            category: 'Safety',
            items: [
                { id: '1', description: 'Proper grounding', status: 'pass', notes: '', photos: [], required: true },
                { id: '2', description: 'Wire gauge compliance', status: 'fail', notes: 'Incorrect gauge in panel B', photos: [], required: true },
                { id: '3', description: 'Circuit breaker ratings', status: 'pass', notes: '', photos: [], required: true }
            ]
        }
    ]);

    const [activeTemplate, setActiveTemplate] = useState<ChecklistTemplate>(templates[0]);
    const [inspections] = useState<Inspection[]>([
        { id: '1', template: 'Foundation Inspection', inspector: 'John Smith', date: new Date(), location: 'Building 3', status: 'in-progress', passRate: 75 },
        { id: '2', template: 'Electrical Safety', inspector: 'Sarah Williams', date: new Date(), location: 'Building 2', status: 'completed', passRate: 100 }
    ]);

    const updateItemStatus = (itemId: string, status: 'pass' | 'fail' | 'na' | 'pending') => {
        setActiveTemplate({
            ...activeTemplate,
            items: activeTemplate.items.map(item =>
                item.id === itemId ? { ...item, status } : item
            )
        });
    };

    const completedItems = activeTemplate.items.filter(i => i.status !== 'pending').length;
    const passedItems = activeTemplate.items.filter(i => i.status === 'pass').length;
    const failedItems = activeTemplate.items.filter(i => i.status === 'fail').length;
    const completionRate = Math.round((completedItems / activeTemplate.items.length) * 100);
    const passRate = completedItems > 0 ? Math.round((passedItems / completedItems) * 100) : 0;

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ✅ Quality Control Checklist
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Conduct inspections and ensure compliance
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <CheckSquare className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{inspections.length}</div>
                        <div className="text-sm opacity-80">Total Inspections</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{passRate}%</div>
                        <div className="text-sm opacity-80">Pass Rate</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
                        <XCircle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{failedItems}</div>
                        <div className="text-sm opacity-80">Failed Items</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <TrendingUp className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{completionRate}%</div>
                        <div className="text-sm opacity-80">Completion</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Checklist */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {activeTemplate.name}
                                    </h2>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {activeTemplate.category}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toast.success('Generating PDF report...')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Export PDF
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Progress: {completedItems}/{activeTemplate.items.length} items
                                    </span>
                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {completionRate}%
                                    </span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Checklist Items */}
                            <div className="space-y-4">
                                {activeTemplate.items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border ${
                                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        #{index + 1}
                                                    </span>
                                                    {item.required && (
                                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-semibold rounded">
                                                            Required
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.description}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Status Buttons */}
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={() => updateItemStatus(item.id, 'pass')}
                                                className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                                                    item.status === 'pass'
                                                        ? 'bg-green-500 text-white'
                                                        : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                Pass
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateItemStatus(item.id, 'fail')}
                                                className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                                                    item.status === 'fail'
                                                        ? 'bg-red-500 text-white'
                                                        : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                Fail
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateItemStatus(item.id, 'na')}
                                                className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                                                    item.status === 'na'
                                                        ? 'bg-gray-500 text-white'
                                                        : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                N/A
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toast.success('Photo captured')}
                                                className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                                                    isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                            >
                                                <Camera className="h-4 w-4 mx-auto" />
                                            </button>
                                        </div>

                                        {/* Notes */}
                                        {item.notes && (
                                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {item.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Templates */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Templates
                            </h3>
                            <div className="space-y-2">
                                {templates.map(template => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => setActiveTemplate(template)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${
                                            activeTemplate.id === template.id
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        <div className="font-semibold">{template.name}</div>
                                        <div className={`text-xs ${activeTemplate.id === template.id ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {template.category} • {template.items.length} items
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Inspections */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Recent Inspections
                            </h3>
                            <div className="space-y-3">
                                {inspections.map(inspection => (
                                    <div
                                        key={inspection.id}
                                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {inspection.template}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                inspection.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                inspection.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {inspection.status}
                                            </span>
                                        </div>
                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {inspection.location} • {inspection.passRate}% pass rate
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QualityControlChecklist;

