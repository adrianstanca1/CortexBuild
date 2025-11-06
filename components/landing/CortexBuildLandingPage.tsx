import React, { useState, useEffect } from 'react';
import {
    Building2, Zap, Brain, Shield, TrendingUp, Users, ArrowRight,
    CheckCircle, Star, Play, ChevronRight, Package, Target,
    BarChart3, Globe, Sparkles, Clock, DollarSign, Award
} from 'lucide-react';

interface CortexBuildLandingPageProps {
    isDarkMode?: boolean;
    onGetStarted?: () => void;
}

const CortexBuildLandingPage: React.FC<CortexBuildLandingPageProps> = ({ 
    isDarkMode = false, 
    onGetStarted 
}) => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI-Powered Intelligence",
            description: "Smart automation and insights that learn from your projects",
            gradient: "from-purple-600 to-pink-600",
            stats: "300% faster decisions"
        },
        {
            icon: <Building2 className="w-8 h-8" />,
            title: "Project Management",
            description: "Complete project lifecycle management with real-time collaboration",
            gradient: "from-blue-600 to-cyan-600",
            stats: "50% time savings"
        },
        {
            icon: <Package className="w-8 h-8" />,
            title: "App Marketplace",
            description: "150+ specialized apps to extend your platform capabilities",
            gradient: "from-green-600 to-emerald-600",
            stats: "150+ apps available"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Advanced Analytics",
            description: "Real-time insights and predictive analytics for better decisions",
            gradient: "from-orange-600 to-red-600",
            stats: "Real-time insights"
        }
    ];

    const stats = [
        { label: "Active Projects", value: "10K+", icon: <Building2 className="w-6 h-6" /> },
        { label: "Happy Users", value: "25K+", icon: <Users className="w-6 h-6" /> },
        { label: "Time Saved", value: "2M+ hrs", icon: <Clock className="w-6 h-6" /> },
        { label: "ROI Average", value: "340%", icon: <TrendingUp className="w-6 h-6" /> }
    ];

    const benefits = [
        "AI-powered project insights and automation",
        "Real-time collaboration across teams",
        "150+ specialized construction apps",
        "Enterprise-grade security and compliance",
        "Mobile-first design for field work",
        "Seamless integrations with existing tools"
    ];

    const testimonials = [
        {
            name: "Michael Rodriguez",
            role: "Project Director",
            company: "BuildTech Solutions",
            content: "CortexBuild transformed how we manage projects. The AI insights alone saved us 40% on our last build.",
            avatar: "👨‍🔧",
            rating: 5
        },
        {
            name: "Sarah Chen",
            role: "Operations Manager",
            company: "ConstructCorp",
            content: "The marketplace apps are game-changers. We found solutions for every challenge we faced.",
            avatar: "👩‍💼",
            rating: 5
        },
        {
            name: "David Thompson",
            role: "Site Supervisor",
            company: "Premier Construction",
            content: "Finally, a platform built for construction professionals. The mobile app is incredibly intuitive.",
            avatar: "👷‍♂️",
            rating: 5
        }
    ];

    const pricingPlans = [
        {
            name: "Starter",
            price: "Free",
            description: "Perfect for small teams getting started",
            features: ["Up to 3 projects", "Basic analytics", "5 team members", "Community support"],
            cta: "Start Free",
            popular: false
        },
        {
            name: "Professional",
            price: "$49/mo",
            description: "For growing construction businesses",
            features: ["Unlimited projects", "Advanced analytics", "25 team members", "Priority support", "Marketplace access"],
            cta: "Start Trial",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations with custom needs",
            features: ["Everything in Pro", "Custom integrations", "Unlimited users", "Dedicated support", "SLA guarantee"],
            cta: "Contact Sales",
            popular: false
        }
    ];

    return (
        <div className={`min-h-screen ${bgClass} transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-8 animate-pulse">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-semibold">The Future of Construction Intelligence</span>
                        </div>
                        
                        <h1 className={`text-5xl md:text-7xl font-black ${textClass} mb-6 leading-tight transform transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
                            Build Smarter,
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Not Harder</span>
                        </h1>
                        
                        <p className={`text-xl md:text-2xl ${mutedClass} mb-12 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
                            AI-powered construction intelligence platform that gives SMBs the power of enterprise-level tools
                        </p>
                        
                        <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
                            <button 
                                onClick={onGetStarted}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center"
                            >
                                Get Started Free
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
                        <div key={index} className={`${cardClass} border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                            <div className="flex justify-center mb-4 text-blue-600">
                                {stat.icon}
                            </div>
                            <div className={`text-3xl font-bold ${textClass} mb-2`}>{stat.value}</div>
                            <div className={`text-sm ${mutedClass}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Everything You Need to
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
                    </h2>
                    <p className={`text-xl ${mutedClass} max-w-3xl mx-auto`}>
                        Comprehensive construction management tools powered by AI
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
                            <p className={`${mutedClass} leading-relaxed mb-4`}>{feature.description}</p>
                            <div className="text-blue-600 font-semibold text-sm">{feature.stats}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-8`}>
                            Why Choose CortexBuild?
                        </h2>
                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    <span className={`${textClass} text-lg`}>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`${cardClass} border rounded-3xl p-8 hover:shadow-xl transition-all duration-300`}>
                        <div className="text-center">
                            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                            <h3 className={`text-2xl font-bold ${textClass} mb-4`}>Industry Recognition</h3>
                            <p className={`${mutedClass} mb-6`}>
                                Trusted by leading construction companies worldwide
                            </p>
                            <div className="flex justify-center space-x-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className={`${textClass} font-semibold`}>4.9/5 Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Trusted by Industry Leaders
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className={`${cardClass} border rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}>
                            <div className="flex items-center mb-6">
                                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                                <div>
                                    <div className={`font-bold ${textClass}`}>{testimonial.name}</div>
                                    <div className={`text-sm ${mutedClass}`}>{testimonial.role}</div>
                                    <div className={`text-sm ${mutedClass}`}>{testimonial.company}</div>
                                </div>
                            </div>
                            <p className={`${mutedClass} leading-relaxed mb-4`}>"{testimonial.content}"</p>
                            <div className="flex text-yellow-400">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Simple, Transparent Pricing
                    </h2>
                    <p className={`text-xl ${mutedClass} max-w-3xl mx-auto`}>
                        Choose the plan that fits your business needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className={`${cardClass} border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 relative ${plan.popular ? 'border-blue-500 scale-105' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className={`text-2xl font-bold ${textClass} mb-2`}>{plan.name}</h3>
                                <div className={`text-4xl font-black ${textClass} mb-2`}>{plan.price}</div>
                                <p className={`${mutedClass} mb-6`}>{plan.description}</p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className={`${textClass}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-bold transition ${
                                    plan.popular 
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
                                        : `${cardClass} border-2 ${textClass} hover:shadow-lg`
                                }`}>
                                    {plan.cta}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className={`${cardClass} border rounded-3xl p-12 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10`}>
                    <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
                        Ready to Transform Your Construction Business?
                    </h2>
                    <p className={`text-xl ${mutedClass} mb-8 max-w-2xl mx-auto`}>
                        Join thousands of construction professionals who trust CortexBuild to manage their projects smarter
                    </p>
                    <button 
                        onClick={onGetStarted}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
                    >
                        Start Your Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CortexBuildLandingPage;
