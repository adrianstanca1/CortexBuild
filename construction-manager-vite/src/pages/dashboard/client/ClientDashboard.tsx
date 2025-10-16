import DashboardLayout from '../../../components/layout/DashboardLayout';
import { mockProjects } from '../../../lib/mockData';
import { FolderKanban, TrendingUp, Calendar } from 'lucide-react';

export default function ClientDashboard() {
  const myProject = mockProjects[0];

  return (
    <DashboardLayout title="Client Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Project</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<FolderKanban />} title="Project Status" value={myProject.status.replace('_', ' ')} />
          <StatCard icon={<TrendingUp />} title="Progress" value={`${myProject.progress}%`} />
          <StatCard icon={<Calendar />} title="Days Remaining" value="45" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 text-xl mb-2">{myProject.name}</h4>
              <p className="text-gray-600">{myProject.description}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-semibold text-gray-900">{myProject.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${myProject.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Budget</p>
                <p className="text-2xl font-bold text-gray-900">${(myProject.budget / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Spent</p>
                <p className="text-2xl font-bold text-gray-900">${(myProject.spent / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="font-medium text-gray-900">{myProject.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          <div className="space-y-3">
            <UpdateItem date="2 days ago" message="Foundation work completed successfully" />
            <UpdateItem date="5 days ago" message="Electrical installation in progress" />
            <UpdateItem date="1 week ago" message="Site preparation completed" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900 capitalize">{value}</p>
        </div>
      </div>
    </div>
  );
}

function UpdateItem({ date, message }: { date: string; message: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
}
