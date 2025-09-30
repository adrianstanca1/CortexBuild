import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Bell, Mail, Smartphone, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';

interface NotificationSettingsProps {
  settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
    projectUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const handleChange = (field: string, value: boolean) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const notificationTypes = [
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail size={20} />,
    },
    {
      id: 'push',
      name: 'Push Notifications',
      description: 'Browser push notifications',
      icon: <Bell size={20} />,
    },
    {
      id: 'sms',
      name: 'SMS Notifications',
      description: 'Text message notifications for urgent alerts',
      icon: <Smartphone size={20} />,
    },
  ];

  const notificationCategories = [
    {
      id: 'projectUpdates',
      name: 'Project Updates',
      description: 'Notifications about project changes, milestones, and deadlines',
      icon: <TrendingUp size={20} />,
    },
    {
      id: 'systemAlerts',
      name: 'System Alerts',
      description: 'Important system notifications and security alerts',
      icon: <AlertTriangle size={20} />,
    },
    {
      id: 'weeklyReports',
      name: 'Weekly Reports',
      description: 'Weekly summary reports and analytics',
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notification Methods */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Notification Methods</h2>
        </div>

        <div className="space-y-4">
          {notificationTypes.map(type => (
            <div key={type.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[type.id as keyof typeof formData]}
                  onChange={(e) => handleChange(type.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Categories */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Notification Categories</h2>

        <div className="space-y-4">
          {notificationCategories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[category.id as keyof typeof formData]}
                  onChange={(e) => handleChange(category.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Schedule */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Notification Schedule</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Quiet Hours
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="w-full border border-border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full border border-border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              No notifications will be sent during these hours
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Weekend Notifications
            </label>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={false} className="rounded" />
              <span className="text-sm">Send notifications on weekends</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Notifications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Test Notifications</h2>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send test notifications to verify your settings are working correctly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" disabled={!formData.email}>
              <Mail size={16} className="mr-2" />
              Test Email
            </Button>
            <Button variant="outline" disabled={!formData.push}>
              <Bell size={16} className="mr-2" />
              Test Push
            </Button>
            <Button variant="outline" disabled={!formData.sms}>
              <Smartphone size={16} className="mr-2" />
              Test SMS
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Notifications</h2>

        <div className="space-y-3">
          {[
            {
              id: 1,
              type: 'Project Update',
              message: 'Project "Office Building" milestone completed',
              time: '2 hours ago',
              method: 'Email, Push',
            },
            {
              id: 2,
              type: 'System Alert',
              message: 'Weekly backup completed successfully',
              time: '1 day ago',
              method: 'Email',
            },
            {
              id: 3,
              type: 'Project Update',
              message: 'New expense added to "Warehouse Construction"',
              time: '2 days ago',
              method: 'Push',
            },
          ].map(notification => (
            <div key={notification.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{notification.type}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {notification.time} • Sent via {notification.method}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4">
          View All Notifications
        </Button>
      </Card>
    </div>
  );
};
