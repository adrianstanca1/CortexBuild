import React from 'react';
import { 
    QuestionMarkCircleIcon, AlertTriangleIcon, DocumentIcon, SparklesIcon 
// Fix: Added file extension to import path.
} from '../Icons';

type StatCardType = 'rfi' | 'overdue' | 'tm-ticket' | 'ai-risk';

interface StatCardProps {
    label: string;
    value: string | number;
    type: StatCardType;
}

const ICONS: Record<StatCardType, React.FC<any>> = {
    'rfi': QuestionMarkCircleIcon,
    'overdue': AlertTriangleIcon,
    'tm-ticket': DocumentIcon,
    'ai-risk': SparklesIcon,
};

const COLORS: Record<StatCardType, string> = {
    'rfi': 'text-red-600',
    'overdue': 'text-amber-600',
    'tm-ticket': 'text-orange-600',
    'ai-risk': 'text-teal-600',
};

const BG_COLORS: Record<StatCardType, string> = {
    'rfi': 'bg-red-100',
    'overdue': 'bg-amber-100',
    'tm-ticket': 'bg-orange-100',
    'ai-risk': 'bg-teal-100',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, type }) => {
    const Icon = ICONS[type];
    const color = COLORS[type];
    const bgColor = BG_COLORS[type];

    return (
        <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100 flex items-center space-x-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div className={`p-3 rounded-full ${bgColor}`}>
                <Icon className={`w-7 h-7 ${color}`} />
            </div>
            <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500 font-semibold">{label}</p>
            </div>
        </div>
    );
};

export default StatCard;