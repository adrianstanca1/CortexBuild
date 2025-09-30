import React from 'react';

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  budget: number;
  timeline: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
  detailed?: boolean;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ 
  projects = [], 
  detailed = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Projects Overview</h3>
        <span className="text-sm text-gray-500">{projects.length} projects</span>
      </div>

      <div className="space-y-4">
        {projects.slice(0, detailed ? projects.length : 5).map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{project.progress}% complete</span>
              <span>${(project.budget / 1000).toFixed(0)}k budget</span>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No projects data available</p>
          </div>
        )}
      </div>
    </div>
  );
};