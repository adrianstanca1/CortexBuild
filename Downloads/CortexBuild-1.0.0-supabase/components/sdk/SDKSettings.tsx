import React from 'react';
import { Settings } from 'lucide-react';

export const SDKSettings: React.FC<{ sdkDeveloper: any }> = ({ sdkDeveloper }) => {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">SDK Settings</h2>
      <p className="text-gray-600 mb-4">
        Manage API keys, subscription, and preferences - Coming Soon
      </p>
      {sdkDeveloper && (
        <div className="mt-6 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            <strong>Subscription:</strong> {sdkDeveloper.subscription_tier}
          </p>
          <p className="text-sm text-gray-600">
            <strong>API Usage:</strong> {sdkDeveloper.api_requests_used} / {sdkDeveloper.api_requests_limit === -1 ? 'Unlimited' : sdkDeveloper.api_requests_limit}
          </p>
        </div>
      )}
    </div>
  );
};
