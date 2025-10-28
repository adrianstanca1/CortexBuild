import DashboardLayout from '../../../components/layout/DashboardLayout';
import { mockTasks } from '../../../lib/mockData';
import { ClipboardList, Clock, AlertTriangle } from 'lucide-react';

export default function WorkerDashboard() {
  const myTasks = mockTasks.slice(0, 2);

  return (
    <DashboardLayout title="Worker Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<ClipboardList />} title="Assigned Tasks" value={myTasks.length} />
          <StatCard icon={<Clock />} title="Hours This Week" value={32} />
          <StatCard icon={<AlertTriangle />} title="Safety Alerts" value={0} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Location: </span>
                    <span className="font-medium">{task.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours: </span>
                    <span className="font-medium">{task.actualHours}/{task.estimatedHours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Safety Reminder</h4>
          <p className="text-sm text-blue-700">
            Always wear proper PPE equipment. Report any safety hazards immediately.
          </p>
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
