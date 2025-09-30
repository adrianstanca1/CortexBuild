import React from 'react';
import { useAppStore } from '../store';

export const TeamPage: React.FC = () => {
  const { teamMembers } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Team</h2>
        
        {teamMembers.length === 0 ? (
          <p className="text-gray-600">
            No team members yet. Team management and performance tracking coming soon...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
                <p className="text-sm mt-2">Status: {member.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
