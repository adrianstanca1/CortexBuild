
import React from 'react';

interface ToolCardProps {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group block text-left bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 ease-in-out"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700">{title}</h3>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{description}</p>
        </button>
    );
};

export default ToolCard;
