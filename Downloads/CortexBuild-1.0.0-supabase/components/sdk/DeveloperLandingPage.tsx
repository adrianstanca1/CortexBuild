import React from 'react';
import { Code, Puzzle, DollarSign, Globe, Wrench, BarChart3, Rocket, CheckCircle } from 'lucide-react';

interface DeveloperLandingPageProps {
  onGetStarted: () => void;
}

export const DeveloperLandingPage: React.FC<DeveloperLandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build the Future of Construction Tech
          </h1>
          <p className="text-2xl text-gray-600 mb-4">Developer Ecosystem</p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join the first open developer platform for construction management. Create, test, and monetize intelligent modules that transform how the industry works.
          </p>
        </div>

        {/* Why Build on CortexBuild */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Build on CortexBuild?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Puzzle className="w-12 h-12 text-blue-600" />,
                title: 'Modular Architecture',
                description: 'Build self-contained modules that integrate seamlessly. Our open-source architecture ensures your innovations work perfectly with the platform.'
              },
              {
                icon: <Wrench className="w-12 h-12 text-green-600" />,
                title: 'Complete Toolset',
                description: 'Access comprehensive APIs, SDKs, and documentation. Build AI agents, automation tools, custom integrations, and more.'
              },
              {
                icon: <DollarSign className="w-12 h-12 text-purple-600" />,
                title: 'Monetization',
                description: 'Publish your modules to our marketplace and earn revenue. Fair revenue sharing model ensures you\'re rewarded for your innovations.'
              },
              {
                icon: <Globe className="w-12 h-12 text-orange-600" />,
                title: 'Global Impact',
                description: 'Your modules reach thousands of construction professionals worldwide. Make a real difference in how the industry operates.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="mb-20 bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Type-Safe, AI-Powered Development
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Type-safe APIs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Real-time data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">AI-powered</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Start Building Now
              </button>
            </div>
            <div className="bg-gray-900 p-8 lg:p-12">
              <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                <code>{`import { CortexBuild } from '@cortexbuild/sdk';

export class SmartScheduler {
  async optimizeSchedule(project: Project) {
    // Access project data
    const tasks = await project.getTasks();

    // Run AI optimization
    const optimized = await this.ai.optimize(tasks);

    // Update schedule
    return project.updateSchedule(optimized);
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Developer Sandbox */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Developer Sandbox
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Safe environment to build, test, and debug your modules before deploying to production
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Wrench className="w-10 h-10 text-blue-600" />,
                title: 'Build & Test',
                description: 'Create modules with our comprehensive SDK. Test in real-time with sample data and debug tools.'
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-green-600" />,
                title: 'Monitor Performance',
                description: 'Track module performance, API usage, and user engagement with built-in analytics.'
              },
              {
                icon: <Rocket className="w-10 h-10 text-purple-600" />,
                title: 'Deploy Instantly',
                description: 'One-click deployment to production. Automatic versioning and rollback support.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module Marketplace */}
        <div className="mb-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-4">
            Module Marketplace
          </h2>
          <p className="text-center text-blue-100 mb-12 max-w-2xl mx-auto">
            Publish your modules and reach thousands of construction professionals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">For Developers</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Publish unlimited modules</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>70% revenue share</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Built-in payment processing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Marketing & promotion support</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">For Users</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Browse 100+ modules</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Community ratings & reviews</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>One-click installation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Free & premium options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-xl shadow-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Building Today
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing community of developers transforming the construction industry
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-lg"
            >
              Get API Access
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all text-lg">
              View Documentation
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all text-lg">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

