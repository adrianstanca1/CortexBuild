import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Building, 
  Users, 
  FolderOpen, 
  HardDrive,
  Palette,
  Upload,
  Globe
} from 'lucide-react';

interface TenantSettingsProps {
  settings: {
    maxUsers: number;
    maxProjects: number;
    storageLimit: number;
    features: string[];
    customDomain: string;
    branding: {
      logo: string;
      primaryColor: string;
      secondaryColor: string;
    };
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const TenantSettings: React.FC<TenantSettingsProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const availableFeatures = [
    { id: 'projects', name: 'Project Management', description: 'Create and manage construction projects' },
    { id: 'financials', name: 'Financial Management', description: 'Track expenses, invoices, and budgets' },
    { id: 'users', name: 'User Management', description: 'Manage team members and permissions' },
    { id: 'reports', name: 'Reports & Analytics', description: 'Generate detailed reports and insights' },
    { id: 'integrations', name: 'Third-party Integrations', description: 'Connect with external tools and services' },
    { id: 'api', name: 'API Access', description: 'Access to REST API for custom integrations' },
  ];

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleBrandingChange = (field: string, value: string) => {
    const updatedBranding = { ...formData.branding, [field]: value };
    const updatedData = { ...formData, branding: updatedBranding };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleFeatureToggle = (featureId: string) => {
    const updatedFeatures = formData.features.includes(featureId)
      ? formData.features.filter(f => f !== featureId)
      : [...formData.features, featureId];
    handleChange('features', updatedFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Organization Limits */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Organization Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Users
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
                min="1"
                max="1000"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current: 4 users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Projects
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="number"
                value={formData.maxProjects}
                onChange={(e) => handleChange('maxProjects', parseInt(e.target.value))}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
                min="1"
                max="10000"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current: 12 projects
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Storage Limit (GB)
            </label>
            <div className="relative">
              <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="number"
                value={formData.storageLimit}
                onChange={(e) => handleChange('storageLimit', parseInt(e.target.value))}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
                min="1"
                max="10000"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Used: 245 GB
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Available Features</h2>
        
        <div className="space-y-4">
          {availableFeatures.map(feature => (
            <div key={feature.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-medium">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature.id)}
                  onChange={() => handleFeatureToggle(feature.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Domain */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Custom Domain</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Domain
            </label>
            <input
              type="text"
              value={formData.customDomain}
              onChange={(e) => handleChange('customDomain', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2"
              placeholder="your-company.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Use your own domain instead of the default subdomain
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Domain Setup Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Add a CNAME record pointing to: platform.asagents.com</li>
              <li>2. Verify domain ownership</li>
              <li>3. SSL certificate will be automatically provisioned</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Branding */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Branding</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border border-border rounded-lg flex items-center justify-center bg-gray-50">
                {formData.branding.logo ? (
                  <img src={formData.branding.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building className="text-muted-foreground" size={24} />
                )}
              </div>
              <div>
                <Button variant="outline">
                  <Upload size={16} className="mr-2" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 200x200px, PNG or SVG
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.branding.secondaryColor}
                  onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.branding.secondaryColor}
                  onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2"
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium mb-3">Preview</h3>
            <div className="flex items-center gap-4">
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: formData.branding.primaryColor }}
              />
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: formData.branding.secondaryColor }}
              />
              <span className="text-sm text-muted-foreground">
                These colors will be used throughout the application
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
