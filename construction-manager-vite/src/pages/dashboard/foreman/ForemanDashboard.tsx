import DashboardLayout from '../../../components/layout/DashboardLayout';
import { mockTasks, mockMaterials } from '../../../lib/mockData';
import { ClipboardList, Package, Clock } from 'lucide-react';

export default function ForemanDashboard() {
  const todayTasks = mockTasks.filter(t => t.status === 'in_progress');
  const lowStockMaterials = mockMaterials.filter(m => m.quantity < m.minQuantity);

  return (
    <DashboardLayout title="Foreman Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Operations</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<ClipboardList />} title="Today's Tasks" value={todayTasks.length} />
          <StatCard icon={<Package />} title="Low Stock Items" value={lowStockMaterials.length} />
          <StatCard icon={<Clock />} title="Hours Logged" value={32} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Material Status</h3>
          <div className="space-y-3">
            {mockMaterials.map((material) => (
              <div key={material.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{material.name}</p>
                  <p className="text-sm text-gray-500">{material.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{material.quantity} {material.unit}</p>
                  <p className={`text-sm ${material.quantity < material.minQuantity ? 'text-red-600' : 'text-green-600'}`}>
                    {material.quantity < material.minQuantity ? 'Low Stock' : 'In Stock'}
                  </p>
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
