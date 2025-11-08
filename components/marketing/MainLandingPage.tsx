/**
 * Main Marketing Landing Page
 * Complete marketing page with features, pricing, testimonials, and CTA
 */

import React from 'react';
import {
    Sparkles, Building2, Code, BarChart3, Shield, Zap,
    CheckCircle, ArrowRight, Users, Globe, Award,
    Rocket, Star, Play
} from 'lucide-react';

interface MainLandingPageProps {
    onGetStarted: () => void;
}

export const MainLandingPage: React.FC<MainLandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-32">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <Sparkles className="w-16 h-16 text-yellow-300" />
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        CortexBuild 2.0
                    </h1>
                    <p className="text-2xl md:text-3xl mb-8 font-light">
                        AI-Powered Construction Intelligence Platform
                    </p>
                    <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
                        Revolutionizing how construction projects are planned, managed, and delivered.
                        Harness the power of AI to build smarter, faster, and more efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                            <Play className="w-5 h-5" /> Watch Demo
                        </button>
                    </div>
                    <div className="mt-12 flex items-center justify-center gap-8 text-sm opacity-80">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>10,000+ Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            <span>50+ Countries</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            <span>Industry Leader</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Everything You Need to Build Better
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            A comprehensive platform combining project management, AI intelligence,
                            financial tracking, and team collaboration in one powerful solution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Sparkles className="w-10 h-10 text-blue-600" />,
                                title: 'AI-Powered Insights',
                                description: 'Get intelligent suggestions and predictions to optimize your projects and reduce risks.',
                                features: ['Risk Prediction', 'Automated Scheduling', 'Smart Recommendations']
                            },
                            {
                                icon: <Building2 className="w-10 h-10 text-green-600" />,
                                title: 'Complete Project Management',
                                description: 'Manage every aspect of your construction projects from planning to completion.',
                                features: ['Task Tracking', 'RFI Management', 'Document Control']
                            },
                            {
                                icon: <BarChart3 className="w-10 h-10 text-purple-600" />,
                                title: 'Real-Time Analytics',
                                description: 'Track performance, costs, and progress with comprehensive dashboards and reports.',
                                features: ['Cost Tracking', 'Performance Metrics', 'Custom Reports']
                            },
                            {
                                icon: <Shield className="w-10 h-10 text-red-600" />,
                                title: 'Quality & Safety',
                                description: 'Ensure compliance and maintain the highest safety standards on every project.',
                                features: ['Safety Reports', 'Quality Checklists', 'Incident Tracking']
                            },
                            {
                                icon: <Code className="w-10 h-10 text-orange-600" />,
                                title: 'Developer Tools',
                                description: 'Build custom modules, automate workflows, and extend the platform with our SDK.',
                                features: ['Custom Development', 'API Access', 'Marketplace Publishing']
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-yellow-600" />,
                                title: 'Automation & Workflows',
                                description: 'Streamline operations with powerful automation and customizable workflows.',
                                features: ['Process Automation', 'Smart Workflows', 'Integration Support']
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 mb-6">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.features.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get started in minutes and transform your construction operations
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                step: '1',
                                title: 'Create Your Account',
                                description: 'Sign up for free and set up your company profile in minutes.',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            {
                                step: '2',
                                title: 'Add Your Projects',
                                description: 'Import existing projects or create new ones with our intuitive interface.',
                                color: 'from-purple-500 to-pink-500'
                            },
                            {
                                step: '3',
                                title: 'Start Building Smarter',
                                description: 'Let AI guide your decisions and watch your productivity soar.',
                                color: 'from-orange-500 to-red-500'
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Trusted by Industry Leaders
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our customers have to say
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Project Manager',
                                company: 'Skanska',
                                content: 'CortexBuild has transformed how we manage our projects. The AI insights have helped us catch issues before they become problems.',
                                rating: 5
                            },
                            {
                                name: 'Michael Chen',
                                role: 'CTO',
                                company: 'Turner Construction',
                                content: 'The developer tools are incredible. We\'ve built custom workflows that save us hours every week.',
                                rating: 5
                            },
                            {
                                name: 'Emily Rodriguez',
                                role: 'Safety Director',
                                company: 'Bechtel',
                                content: 'The quality and safety features are top-notch. We\'ve seen a 40% reduction in incident reports.',
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-gray-600">{testimonial.role}, {testimonial.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600">
                            Choose the plan that fits your needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Starter',
                                price: '$49',
                                description: 'Perfect for small teams',
                                features: ['Up to 10 users', 'Basic project management', 'Email support', '5 projects']
                            },
                            {
                                name: 'Professional',
                                price: '$149',
                                description: 'For growing companies',
                                features: ['Up to 50 users', 'Advanced AI features', 'Priority support', 'Unlimited projects', 'Custom workflows'],
                                popular: true
                            },
                            {
                                name: 'Enterprise',
                                price: 'Custom',
                                description: 'For large organizations',
                                features: ['Unlimited users', 'Full feature access', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Training included']
                            }
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-xl p-8 shadow-lg border-2 ${plan.popular ? 'border-blue-600 relative' : 'border-gray-200'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                                    {plan.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                                </div>
                                <button
                                    onClick={onGetStarted}
                                    className={`w-full py-3 rounded-lg font-bold mb-8 ${plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        } transition-colors`}
                                >
                                    Get Started
                                </button>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Rocket className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your Construction Business?
                    </h2>
                    <p className="text-xl mb-12 opacity-90">
                        Join thousands of construction professionals who are already building smarter with CortexBuild.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-xl"
                        >
                            Start Your Free Trial
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-8 h-8" />
                                <span className="text-xl font-bold">CortexBuild</span>
                            </div>
                            <p className="text-gray-400">
                                The future of construction intelligence.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>© 2024 CortexBuild. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLandingPage;
