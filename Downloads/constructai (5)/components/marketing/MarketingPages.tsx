/**
 * Marketing Pages Component
 * 8 Marketing pages for the platform
 */

import React, { useState } from 'react';
import { ChevronRight, Star, Users, Zap, Shield, TrendingUp, Code, Smartphone } from 'lucide-react';

export const MarketingPages = () => {
    const [currentPage, setCurrentPage] = useState<'landing' | 'features' | 'pricing' | 'about' | 'blog' | 'docs' | 'contact' | 'legal'>('landing');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Navigation */}
            <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-white">CortexBuild</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            {['landing', 'features', 'pricing', 'about', 'blog', 'docs', 'contact'].map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as any)}
                                    className={`capitalize transition-colors ${
                                        currentPage === page ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Landing Page */}
            {currentPage === 'landing' && (
                <div className="space-y-20 py-20">
                    {/* Hero Section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center space-y-8">
                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                Construction Management
                                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Reimagined</span>
                            </h1>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                AI-powered platform for modern construction teams. Manage projects, teams, and workflows with intelligent automation.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                                    Get Started <ChevronRight size={20} />
                                </button>
                                <button className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Features Preview */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Users, title: 'Team Collaboration', desc: 'Real-time collaboration tools for seamless teamwork' },
                                { icon: Zap, title: 'AI Automation', desc: 'Intelligent automation for repetitive tasks' },
                                { icon: TrendingUp, title: 'Analytics', desc: 'Deep insights into project performance' }
                            ].map((feature, i) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                                    <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Features Page */}
            {currentPage === 'features' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-12">Powerful Features</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        {[
                            { title: 'Project Management', features: ['Timeline tracking', 'Budget management', 'Resource allocation'] },
                            { title: 'Team Collaboration', features: ['Real-time updates', 'Task assignment', 'Communication tools'] },
                            { title: 'AI Agents', features: ['Automated workflows', 'Predictive analytics', 'Smart recommendations'] },
                            { title: 'Developer Platform', features: ['API access', 'Custom integrations', 'Marketplace apps'] }
                        ].map((section, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                                <h3 className="text-2xl font-semibold text-white mb-4">{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-gray-300">
                                            <Star size={16} className="text-blue-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Pricing Page */}
            {currentPage === 'pricing' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Simple, Transparent Pricing</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { name: 'Free', price: '$0', features: ['Up to 5 users', '10 projects', '5GB storage'] },
                            { name: 'Starter', price: '$99', features: ['Up to 50 users', '100 projects', '100GB storage'] },
                            { name: 'Professional', price: '$299', features: ['Unlimited users', 'Unlimited projects', '1TB storage'] },
                            { name: 'Enterprise', price: 'Custom', features: ['Everything', 'Dedicated support', 'Custom SLA'] }
                        ].map((plan, i) => (
                            <div key={i} className={`rounded-lg p-8 border transition-colors ${
                                i === 2 ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/50 border-slate-700'
                            }`}>
                                <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                                <p className="text-3xl font-bold text-white mb-6">{plan.price}</p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="text-gray-300 flex items-center gap-2">
                                            <ChevronRight size={16} className="text-blue-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                                    i === 2 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 text-white hover:border-gray-400'
                                }`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* About Page */}
            {currentPage === 'about' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-8">About CortexBuild</h2>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 space-y-6">
                        <p className="text-gray-300 text-lg">
                            CortexBuild is a modern construction management platform built for teams that want to work smarter, not harder.
                        </p>
                        <p className="text-gray-300 text-lg">
                            With AI-powered automation, real-time collaboration, and powerful analytics, we help construction companies deliver projects on time and on budget.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                            {[
                                { number: '500+', label: 'Companies' },
                                { number: '50K+', label: 'Users' },
                                { number: '$2B+', label: 'Projects Managed' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-4xl font-bold text-blue-400">{stat.number}</p>
                                    <p className="text-gray-400 mt-2">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Blog Page */}
            {currentPage === 'blog' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-12">Latest Articles</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'AI in Construction', date: 'Oct 15, 2025' },
                            { title: 'Team Collaboration Best Practices', date: 'Oct 10, 2025' },
                            { title: 'Project Management Tips', date: 'Oct 5, 2025' }
                        ].map((article, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
                                <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                                <p className="text-gray-400 text-sm">{article.date}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Docs Page */}
            {currentPage === 'docs' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-12">Documentation</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: 'Getting Started', icon: Smartphone },
                            { title: 'API Reference', icon: Code },
                            { title: 'Integrations', icon: Zap },
                            { title: 'Security', icon: Shield }
                        ].map((doc, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer">
                                <doc.icon className="w-12 h-12 text-blue-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white">{doc.title}</h3>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact Page */}
            {currentPage === 'contact' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Get in Touch</h2>
                    <div className="max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg p-12">
                        <form className="space-y-6">
                            <input type="text" placeholder="Your Name" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
                            <input type="email" placeholder="Your Email" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
                            <textarea placeholder="Your Message" rows={5} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"></textarea>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 CortexBuild. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MarketingPages;

