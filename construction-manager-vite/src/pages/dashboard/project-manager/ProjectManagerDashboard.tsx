import DashboardLayout from '../../../components/layout/DashboardLayout';
import { mockProjects, mockTasks } from '../../../lib/mockData';
import { FolderKanban, ClipboardList } from 'lucide-react';

export default function ProjectManagerDashboard() {
  const myProjects = mockProjects.filter(p => p.status === 'in_progress').slice(0, 3);

  return (
    <DashboardLayout title="Project Manager Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <StatCard icon={<FolderKanban />} title="Active Projects" value={myProjects.length} />
          <StatCard icon={<ClipboardList />} title="Total Tasks" value={mockTasks.length} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Project List</h3>
          <div className="space-y-4">
            {myProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500">{project.location}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-600">Budget: ${(project.budget / 1000).toFixed(0)}K</span>
                  <span className="text-gray-600">Spent: ${(project.spent / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
