import React from 'react';

interface TeamData {
  utilizationRate: number;
  productivityScore: number;
  members: Array<{
    id: string;
    name: string;
    role: string;
    hoursWorked: number;
    status: string;
  }>;
}

interface TeamPerformanceProps {
  team: TeamData | null;
  detailed?: boolean;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({ 
  team, 
  detailed = false 
}) => {
  if (!team) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No team data available</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {team.utilizationRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Utilization Rate</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {team.productivityScore.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Productivity Score</p>
        </div>
      </div>

      {detailed && team.members && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Team Members</h4>
          <div className="space-y-3">
            {team.members.slice(0, 10).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {member.hoursWorked}h
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};