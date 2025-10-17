import React, { useState } from 'react';
import {
    TrendingUp, Mail, Share2, Target, BarChart3, Users, MessageSquare,
    Calendar, DollarSign, Globe, Search, Megaphone, FileText, Video,
    Zap, ArrowRight, CheckCircle, Star, Play, ChevronRight
} from 'lucide-react';

interface MarketingLandingPageProps {
    isDarkMode?: boolean;
}

const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({ isDarkMode = false }) => {
    const [activeFeature, setActiveFeature] = useState(0);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

    const features = [
        {
            icon: <Mail className="w-8 h-8" />,
            title: "Email Marketing",
            description: "Create stunning email campaigns with AI-powered content generation",
            gradient: "from-blue-600 to-cyan-600"
        },
        {
            icon: <Share2 className="w-8 h-8" />,
            title: "Social Media Management",
            description: "Schedule and manage posts across all social platforms",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Lead Generation",
            description: "Capture and nurture leads with intelligent automation",
            gradient: "from-green-600 to-emerald-600"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Analytics & Insights",
            description: "Track performance with real-time analytics and reporting",
            gradient: "from-orange-600 to-red-600"
        }
    ];

    const stats = [
        { label: "Active Campaigns", value: "2,847", change: "+12%" },
        { label: "Email Open Rate", value: "68.4%", change: "+5.2%" },
        { label: "Social Engagement", value: "94.2K", change: "+18%" },
        { label: "Leads Generated", value: "1,234", change: "+24%" }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Marketing Director",
            company: "TechCorp",
            content: "CortexBuild's marketing suite transformed our campaigns. We saw 300% increase in engagement!",
            avatar: "👩‍💼"
        },
        {
            name: "Mike Chen",
            role: "Growth Manager",
            company: "StartupXYZ",
            content: "The AI-powered content generation saved us 20 hours per week. Incredible ROI!",
            avatar: "👨‍💻"
        }
    ];

    return (
        <div className={`min-h-screen ${bgClass}`}>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full mb-8 animate-pulse">
                            <Zap className="w-5 h-5" />
                            <span className="font-semibold">AI-Powered Marketing Suite</span>
                        </div>
                        
                        <h1 className={`text-5xl md:text-7xl font-black ${textClass} mb-6 leading-tight`}>
                            Marketing That
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Works</span>
                        </h1>
                        
                        <p className={`text-xl md:text-2xl ${mutedClass} mb-12 max-w-3xl mx-auto leading-relaxed`}>
                            Transform your marketing with AI-powered tools that generate content, automate campaigns, and deliver results
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center">
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                            <button className={`${cardClass} border-2 px-8 py-4 rounded-xl font-bold text-lg ${textClass} hover:shadow-lg transition flex items-center justify-center`}>
                                <Play className="w-5 h-5 mr-2" />
                                Watch Demo
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
                            <div className={`text-3xl font-bold ${textClass} mb-2`}>{stat.value}</div>
                            <div className={`text-sm ${mutedClass} mb-1`}>{stat.label}</div>
                            <div className="text-green-500 text-sm font-semibold">{stat.change}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Everything You Need to
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Succeed</span>
                    </h2>
                    <p className={`text-xl ${mutedClass} max-w-3xl mx-auto`}>
                        Comprehensive marketing tools powered by AI to help you create, automate, and optimize your campaigns
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${cardClass} border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                            onMouseEnter={() => setActiveFeature(index)}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                                {feature.icon}
                            </div>
                            <h3 className={`text-xl font-bold ${textClass} mb-4`}>{feature.title}</h3>
                            <p className={`${mutedClass} leading-relaxed`}>{feature.description}</p>
                            <div className="mt-6 flex items-center text-purple-600 font-semibold">
                                Learn more
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Loved by Marketing Teams
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
                <div className={`${cardClass} border rounded-3xl p-12 text-center bg-gradient-to-r from-purple-600/10 to-blue-600/10`}>
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Ready to Transform Your Marketing?
                    </h2>
                    <p className={`text-xl ${mutedClass} mb-8 max-w-2xl mx-auto`}>
                        Join thousands of businesses using CortexBuild to create better campaigns, generate more leads, and grow faster
                    </p>
                    <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105">
                        Get Started Today
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketingLandingPage;
