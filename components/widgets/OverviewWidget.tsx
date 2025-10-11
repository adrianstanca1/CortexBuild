import React from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project } from '../../types';
// Fix: Corrected import paths to include file extensions.
import { BuildingOfficeIcon, MapPinIcon } from '../Icons';

interface OverviewWidgetProps {
    project: Project;
}

const OverviewWidget: React.FC<OverviewWidgetProps> = ({ project }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-6 h-6 mr-2 text-gray-500"/>
                Project Overview
            </h2>
            <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPinIcon className="w-4 h-4 mr-1"/>{project.location}
            </p>
            <p className="text-gray-600 mt-4">{project.description}</p>
        </div>
    );
};

export default OverviewWidget;
