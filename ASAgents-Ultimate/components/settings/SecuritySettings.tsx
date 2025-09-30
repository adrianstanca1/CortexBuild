import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Lock, Clock, Globe, AlertTriangle } from 'lucide-react';

interface SecuritySettingsProps {
  settings: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handlePasswordPolicyChange = (field: string, value: any) => {
    const updatedPolicy = { ...formData.passwordPolicy, [field]: value };
    const updatedData = { ...formData, passwordPolicy: updatedPolicy };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Password Policy</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={formData.passwordPolicy.minLength}
              onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
              className="w-full border border-border rounded-lg px-3 py-2"
              min="6"
              max="32"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Require uppercase letters</span>
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireUppercase}
                onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Require numbers</span>
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireNumbers}
                onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Require symbols</span>
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireSymbols}
                onChange={(e) => handlePasswordPolicyChange('requireSymbols', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Session Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={formData.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full border border-border rounded-lg px-3 py-2"
              min="15"
              max="1440"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Require Two-Factor Authentication</span>
              <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
            </div>
            <input
              type="checkbox"
              checked={formData.twoFactorRequired}
              onChange={(e) => handleChange('twoFactorRequired', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </Card>

      {/* IP Whitelist */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">IP Access Control</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Allowed IP Addresses
            </label>
            <textarea
              value={formData.ipWhitelist.join('\n')}
              onChange={(e) => handleChange('ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
              className="w-full border border-border rounded-lg px-3 py-2 h-32"
              placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;203.0.113.1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter one IP address or CIDR block per line. Leave empty to allow all IPs.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-600" size={16} />
              <span className="font-medium text-yellow-900">Warning</span>
            </div>
            <p className="text-sm text-yellow-800">
              Be careful when restricting IP access. Make sure your current IP is included to avoid being locked out.
            </p>
          </div>
        </div>
      </Card>

      {/* Security Monitoring */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Security Monitoring</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Failed Login Attempts</h3>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Active Sessions</h3>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-sm text-muted-foreground">Currently logged in</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              View Security Audit Log
            </Button>
            <Button variant="outline" className="w-full">
              Force Logout All Users
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              Reset All Passwords
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
