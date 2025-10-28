import React from 'react';
import { Screen, User, PermissionAction, PermissionSubject } from '../../../types';
import { ToolDefinition, BUSINESS_DEVELOPMENT_TOOLS } from '../../../tool-definitions';
import ToolCard from '../../shared/ToolCard';
import { ChevronLeftIcon } from '../../Icons';

interface BusinessDevelopmentScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    openProjectSelector: (title: string, onSelect: (projectId: string) => void) => void;
    onDeepLink: (projectId: string | null, screen: Screen, params: any) => void;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
}

const BusinessDevelopmentScreen: React.FC<BusinessDevelopmentScreenProps> = ({ currentUser, navigateTo, goBack, openProjectSelector, onDeepLink, can }) => {
    const visibleTools = BUSINESS_DEVELOPMENT_TOOLS.filter(tool => 
        can(tool.permission.action, tool.permission.subject)
    );

    const handleToolClick = (tool: ToolDefinition) => {
        if (tool.requiresProjectContext) {
            openProjectSelector(`Select a project for ${tool.title}`, (projectId) => {
                onDeepLink(projectId, tool.screen!, { title: tool.title });
            });
        } else {
            onDeepLink(null, tool.screen!, { title: tool.title });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Development</h1>
                    <p className="text-sm text-gray-500">Manage clients, leads, and procurement.</p>
                </div>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTools.map(tool => (
                    <ToolCard 
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        onClick={() => handleToolClick(tool)}
                    />
                ))}
                 {visibleTools.length === 0 && (
                    <p className="text-gray-500 md:col-span-2 lg:col-span-3">You do not have access to any business development tools.</p>
                )}
            </main>
        </div>
    );
};

export default BusinessDevelopmentScreen;