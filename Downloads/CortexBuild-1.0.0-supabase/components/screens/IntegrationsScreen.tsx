// components/screens/IntegrationsScreen.tsx
import React, { useState } from 'react';
import { ThirdPartyIntegrations } from '../integrations/ThirdPartyIntegrations';

interface IntegrationsScreenProps {
    currentUser: any;
    projectId?: string;
}

export const IntegrationsScreen: React.FC<IntegrationsScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

    const handleIntegrationConnect = (integrationId: string) => {
        console.log('Connecting integration:', integrationId);
        setConnectedIntegrations(prev => [...prev, integrationId]);
    };

    const handleIntegrationDisconnect = (integrationId: string) => {
        console.log('Disconnecting integration:', integrationId);
        setConnectedIntegrations(prev => prev.filter(id => id !== integrationId));
    };

    const handleIntegrationConfigure = (integrationId: string) => {
        console.log('Configuring integration:', integrationId);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Third-Party Integrations</h1>
                <p className="text-gray-600">Connect CortexBuild with your favorite business tools and services</p>
            </div>

            <ThirdPartyIntegrations
                currentUser={currentUser}
                onIntegrationConnect={handleIntegrationConnect}
                onIntegrationDisconnect={handleIntegrationDisconnect}
                onIntegrationConfigure={handleIntegrationConfigure}
                className="mb-6"
            />

            {/* Integration Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Accounting</h3>
                    <p className="text-sm text-green-800 mb-4">
                        Sync invoices, expenses, and financial data with QuickBooks, Xero, and other accounting platforms.
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                        <li>• Automated invoice generation</li>
                        <li>• Expense tracking and categorization</li>
                        <li>• Financial reporting integration</li>
                        <li>• Tax preparation support</li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Payments</h3>
                    <p className="text-sm text-blue-800 mb-4">
                        Process payments, manage subscriptions, and handle billing through Stripe and other payment processors.
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Online payment processing</li>
                        <li>• Subscription management</li>
                        <li>• Automated billing cycles</li>
                        <li>• Refund and dispute handling</li>
                    </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Communication</h3>
                    <p className="text-sm text-purple-800 mb-4">
                        Keep your team connected with Slack, Microsoft Teams, and other communication platforms.
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1">
                        <li>• Project notifications</li>
                        <li>• Team collaboration tools</li>
                        <li>• File sharing and storage</li>
                        <li>• Meeting integration</li>
                    </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Productivity</h3>
                    <p className="text-sm text-orange-800 mb-4">
                        Enhance productivity with Google Calendar, Dropbox, and other productivity tools.
                    </p>
                    <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Calendar synchronization</li>
                        <li>• Document management</li>
                        <li>• Task and deadline tracking</li>
                        <li>• Team scheduling</li>
                    </ul>
                </div>
            </div>

            {/* API Documentation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Webhook Integration</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Set up webhooks to receive real-time updates from CortexBuild to your external systems.
                        </p>
                        <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                            POST https://your-domain.com/webhook/cortexbuild<br />
                            Content-Type: application/json<br />
                            X-Signature: sha256=...
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">REST API</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Use our REST API to integrate CortexBuild data with your custom applications.
                        </p>
                        <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                            GET /api/v1/projects<br />
                            Authorization: Bearer your-api-key<br />
                            Content-Type: application/json
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        View Full API Documentation
                    </button>
                </div>
            </div>
        </div>
    );
};
