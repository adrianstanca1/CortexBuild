import React, { useState } from 'react';
import {
    Package, Download, Star, TrendingUp, Users, Building2, Sparkles,
    Gem, Zap, Brain, Shield, FileText, DollarSign, Calendar, Target,
    Layers, ArrowRight, CheckCircle, Play, ChevronRight, Search,
    Filter, Grid3x3, Eye, Clock
} from 'lucide-react';

interface MarketplaceLandingPageProps {
    isDarkMode?: boolean;
}

const MarketplaceLandingPage: React.FC<MarketplaceLandingPageProps> = ({ isDarkMode = false }) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

    const categories = [
        { id: 'all', name: 'All Apps', icon: <Grid3x3 className="w-5 h-5" />, count: 150 },
        { id: 'productivity', name: 'Productivity', icon: <Zap className="w-5 h-5" />, count: 45 },
        { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, count: 32 },
        { id: 'communication', name: 'Communication', icon: <Users className="w-5 h-5" />, count: 28 },
        { id: 'ai', name: 'AI Tools', icon: <Brain className="w-5 h-5" />, count: 25 },
        { id: 'finance', name: 'Finance', icon: <DollarSign className="w-5 h-5" />, count: 20 }
    ];

    const featuredApps = [
        {
            id: '1',
            name: 'Project Analytics Pro',
            description: 'Advanced analytics dashboard with AI-powered insights',
            icon: '📊',
            category: 'Analytics',
            rating: 4.9,
            downloads: '12.5K',
            price: 'Free',
            isFeatured: true,
            tags: ['Popular', 'AI-Powered']
        },
        {
            id: '2',
            name: 'Smart Invoice Generator',
            description: 'Automated invoice creation with payment tracking',
            icon: '🧾',
            category: 'Finance',
            rating: 4.8,
            downloads: '8.9K',
            price: '$29/mo',
            isFeatured: true,
            tags: ['Trending', 'Time-Saver']
        },
        {
            id: '3',
            name: 'Team Collaboration Hub',
            description: 'Real-time collaboration tools for construction teams',
            icon: '👥',
            category: 'Communication',
            rating: 4.7,
            downloads: '15.2K',
            price: 'Free',
            isFeatured: true,
            tags: ['Essential', 'Team Favorite']
        }
    ];

    const stats = [
        { label: "Total Apps", value: "150+", icon: <Package className="w-6 h-6" /> },
        { label: "Active Users", value: "25K+", icon: <Users className="w-6 h-6" /> },
        { label: "Downloads", value: "500K+", icon: <Download className="w-6 h-6" /> },
        { label: "Avg Rating", value: "4.8★", icon: <Star className="w-6 h-6" /> }
    ];

    const benefits = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Instant Installation",
            description: "One-click installation with automatic updates and seamless integration",
            gradient: "from-yellow-500 to-orange-500"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Secure & Reliable",
            description: "All apps are vetted for security and performance before publication",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI-Enhanced",
            description: "Many apps feature AI capabilities to boost your productivity",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Purpose-Built",
            description: "Apps specifically designed for construction and project management",
            gradient: "from-blue-500 to-cyan-500"
        }
    ];

    const testimonials = [
        {
            name: "David Rodriguez",
            role: "Project Manager",
            company: "BuildCorp",
            content: "The marketplace has everything we need. Found 5 apps that saved us 15 hours per week!",
            avatar: "👨‍🔧"
        },
        {
            name: "Lisa Thompson",
            role: "Operations Director",
            company: "ConstructCo",
            content: "Quality apps, easy installation, and great support. Our team productivity increased by 40%!",
            avatar: "👩‍💼"
        }
    ];

    return (
        <div className={`min-h-screen ${bgClass}`}>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-8 animate-pulse">
                            <Package className="w-5 h-5" />
                            <span className="font-semibold">Global App Marketplace</span>
                        </div>
                        
                        <h1 className={`text-5xl md:text-7xl font-black ${textClass} mb-6 leading-tight`}>
                            Discover Apps That
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Supercharge</span>
                            <br />Your Workflow
                        </h1>
                        
                        <p className={`text-xl md:text-2xl ${mutedClass} mb-12 max-w-3xl mx-auto leading-relaxed`}>
                            Browse 150+ vetted applications designed specifically for construction professionals. Install instantly and boost your productivity.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center">
                                Browse Apps
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                            <button className={`${cardClass} border-2 px-8 py-4 rounded-xl font-bold text-lg ${textClass} hover:shadow-lg transition flex items-center justify-center`}>
                                <Play className="w-5 h-5 mr-2" />
                                See How It Works
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className={`${cardClass} border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300`}>
                            <div className="flex justify-center mb-4 text-blue-600">
                                {stat.icon}
                            </div>
                            <div className={`text-3xl font-bold ${textClass} mb-2`}>{stat.value}</div>
                            <div className={`text-sm ${mutedClass}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Explore by Category
                    </h2>
                    <p className={`text-xl ${mutedClass} max-w-3xl mx-auto`}>
                        Find the perfect apps for your specific needs
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`${cardClass} border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                                activeCategory === category.id ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex justify-center mb-3 text-blue-600">
                                {category.icon}
                            </div>
                            <div className={`font-semibold ${textClass} mb-1`}>{category.name}</div>
                            <div className={`text-sm ${mutedClass}`}>{category.count} apps</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Apps Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Featured Apps
                    </h2>
                    <p className={`text-xl ${mutedClass} max-w-3xl mx-auto`}>
                        Hand-picked applications that deliver exceptional value
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredApps.map((app) => (
                        <div key={app.id} className={`${cardClass} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-4xl">{app.icon}</div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${textClass}`}>{app.name}</h3>
                                        <div className={`text-sm ${mutedClass}`}>{app.category}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${textClass}`}>{app.price}</div>
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current mr-1" />
                                        <span className="text-sm">{app.rating}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className={`${mutedClass} mb-4 leading-relaxed`}>{app.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {app.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-500">
                                    <Download className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{app.downloads}</span>
                                </div>
                                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                                    Install
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Why Choose Our Marketplace?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className={`${cardClass} border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                            <div className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto`}>
                                {benefit.icon}
                            </div>
                            <h3 className={`text-xl font-bold ${textClass} mb-4`}>{benefit.title}</h3>
                            <p className={`${mutedClass} leading-relaxed`}>{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Trusted by Professionals
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className={`${cardClass} border rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}>
                            <div className="flex items-center mb-6">
                                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                                <div>
                                    <div className={`font-bold ${textClass}`}>{testimonial.name}</div>
                                    <div className={`text-sm ${mutedClass}`}>{testimonial.role} at {testimonial.company}</div>
                                </div>
                            </div>
                            <p className={`${mutedClass} leading-relaxed mb-4`}>"{testimonial.content}"</p>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className={`${cardClass} border rounded-3xl p-12 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10`}>
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Ready to Boost Your Productivity?
                    </h2>
                    <p className={`text-xl ${mutedClass} mb-8 max-w-2xl mx-auto`}>
                        Join thousands of professionals who use our marketplace to find the perfect tools for their workflow
                    </p>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105">
                        Explore Marketplace
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceLandingPage;
