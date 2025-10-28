import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Users, FolderKanban, DollarSign, ClipboardList } from 'lucide-react';
import { mockProjects, mockUsers, mockTasks } from '../../../lib/mockData';

export default function AdminDashboard() {
  const totalRevenue = mockProjects.reduce((sum, p) => sum + p.budget, 0);
  const activeProjects = mockProjects.filter(p => p.status === 'in_progress').length;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FolderKanban className="h-6 w-6" />}
            title="Total Projects"
            value={mockProjects.length}
            subtitle={`${activeProjects} active`}
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Active Users"
            value={mockUsers.length}
            subtitle="Team members"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            title="Total Revenue"
            value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="All projects"
          />
          <StatCard
            icon={<ClipboardList className="h-6 w-6" />}
            title="Active Tasks"
            value={mockTasks.length}
            subtitle="In progress"
          />
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
          <div className="space-y-4">
            {mockProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="grid gap-4 md:grid-cols-5">
            {['admin', 'project_manager', 'foreman', 'worker', 'client'].map((role) => {
              const count = mockUsers.filter(u => u.role === role).length;
              return (
                <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{role.replace('_', ' ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400">{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
