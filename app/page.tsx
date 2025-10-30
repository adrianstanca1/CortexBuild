/**
 * Landing Page - CortexBuild Platform
 * Full-featured landing page with Hero, Features, and CTAs
 */

import { ArrowRight, BarChart3, Building2, Globe, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CortexBuild - AI-Powered Construction Management Platform',
  description: 'Revolutionary construction platform with AI, real-time collaboration, and enterprise features',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">CortexBuild</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            The Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Construction Management
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Enterprise-grade platform powered by AI with real-time collaboration,
            advanced analytics, and seamless integrations for modern construction teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {[
            { label: 'Active Projects', value: '10,000+' },
            { label: 'Team Members', value: '50,000+' },
            { label: 'Documents Managed', value: '5M+' },
            { label: 'Cost Saved', value: '$2B+' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Build Better
          </h2>
          <p className="text-xl text-gray-400">
            Comprehensive tools for modern construction management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'AI-Powered Insights',
              description: 'Predictive analytics, cost forecasting, and risk assessment powered by advanced AI'
            },
            {
              icon: Users,
              title: 'Real-time Collaboration',
              description: 'Work together seamlessly with live updates, presence tracking, and instant messaging'
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              description: 'Comprehensive dashboards with real-time metrics, custom reports, and data visualization'
            },
            {
              icon: Building2,
              title: 'Project Management',
              description: 'Complete project lifecycle management with tasks, schedules, and resource allocation'
            },
            {
              icon: Shield,
              title: 'Enterprise Security',
              description: 'Bank-level security with role-based access, multi-tenant isolation, and audit logs'
            },
            {
              icon: Globe,
              title: 'Global Scale',
              description: 'Cloud-native architecture designed for global teams with 99.9% uptime'
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboards Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Role-Based Dashboards
          </h2>
          <p className="text-xl text-gray-400">
            Customized experience for every role in your organization
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              role: 'Super Admin',
              color: 'from-red-500 to-red-600',
              features: ['Platform Control', 'User Management', 'System Config', 'Analytics']
            },
            {
              role: 'Company Admin',
              color: 'from-orange-500 to-orange-600',
              features: ['Project Management', 'Team Coordination', 'Billing', 'Reports']
            },
            {
              role: 'Developer',
              color: 'from-green-500 to-green-600',
              features: ['SDK Access', 'API Builder', 'Testing Tools', 'Git Integration']
            }
          ].map((dash, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className={`h-2 rounded-full bg-gradient-to-r ${dash.color} mb-4`} />
              <h3 className="text-2xl font-bold text-white mb-4">{dash.role}</h3>
              <ul className="space-y-2">
                {dash.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Construction Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of construction professionals using CortexBuild to build better, faster, and smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-white">CortexBuild</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 CortexBuild. Built with Next.js 16.0.1, React 19.2.0 & TypeScript 5.9.3
            </div>
            <div className="flex gap-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-gray-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
