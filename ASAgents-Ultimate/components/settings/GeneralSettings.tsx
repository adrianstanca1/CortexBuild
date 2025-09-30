import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  DollarSign,
  Languages
} from 'lucide-react';

interface GeneralSettingsProps {
  settings: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const dateFormats = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'MMM DD, YYYY',
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
  ];

  const handleChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Company Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
                placeholder="Enter company email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
                placeholder="Enter company phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <textarea
                value={formData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2 h-20 resize-none"
                placeholder="Enter company address"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Regional Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Regional Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date Format
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <select
                value={formData.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
              >
                {dateFormats.map(format => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Currency
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Language
            </label>
            <div className="relative">
              <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Application Version
              </label>
              <div className="text-foreground">v2.1.0</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Database Version
              </label>
              <div className="text-foreground">MySQL 8.0.35</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Last Backup
              </label>
              <div className="text-foreground">March 15, 2024 at 2:00 AM</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Server Status
              </label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your company data in CSV format
              </p>
            </div>
            <Button variant="outline">
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Backup Database</h3>
              <p className="text-sm text-muted-foreground">
                Create a manual backup of your database
              </p>
            </div>
            <Button variant="outline">
              Backup Now
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Delete All Data</h3>
              <p className="text-sm text-red-700">
                Permanently delete all company data. This action cannot be undone.
              </p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
