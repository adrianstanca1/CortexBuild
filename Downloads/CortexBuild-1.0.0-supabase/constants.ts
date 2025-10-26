// Fix: Corrected import path to include file extension.
import { Project, ProjectSnapshot } from './types';

// Fix: Added missing description, contacts, companyId, and snapshot properties to MOCK_PROJECT to match the Project type definition.
export const MOCK_PROJECT: Project = {
    id: 'proj-1',
    companyId: 'comp-1',
    name: 'Metropolis Grand Tower',
    location: '123 Main St, Metropolis, USA',
    image: 'https://picsum.photos/seed/project/800/600',
    description: 'A 50-story mixed-use skyscraper featuring retail, office, and residential units. Currently in the structural steel phase.',
    contacts: [
        { role: 'Project Manager', name: 'Jane PM' },
        { role: 'Superintendent', name: 'Mike Superintendent' },
        { role: 'Lead Foreman', name: 'John Foreman' },
    ],
    snapshot: {
        openRFIs: 3,
        overdueTasks: 1,
        pendingTMTickets: 5,
        aiRiskLevel: 'Low',
    }
};

export const MOCK_PROJECT_SNAPSHOT: ProjectSnapshot = {
    openRFIs: 3,
    overdueTasks: 1,
    pendingTMTickets: 5,
    aiRiskLevel: 'Low',
};