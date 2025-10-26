// components/screens/CollaborationHubScreen.tsx
import React, { useState } from 'react';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface CollaborationHubScreenProps {
    currentUser: any;
    projectId?: string;
}

export const CollaborationHubScreen: React.FC<CollaborationHubScreenProps> = ({
    currentUser,
    projectId
}) => {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaboration Hub</h1>
                <p className="text-gray-600">Communicate and collaborate with your team in real-time</p>
            </div>

            <CollaborationHub
                projectId={projectId}
                currentUser={{
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar,
                    role: currentUser.role
                }}
                className="h-[600px]"
            />
        </div>
    );
};
