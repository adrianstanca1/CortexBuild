import React from 'react';
import { 
    Brain, 
    Building2, 
    Zap, 
    Shield, 
    Target, 
    Globe, 
    Users, 
    BarChart3,
    FileText,
    Clock,
    Smartphone,
    Cloud,
    ArrowLeft,
    CheckCircle,
    Sparkles
} from 'lucide-react';

interface FeaturesPageProps {
    onNavigateBack: () => void;
    onNavigateToLogin: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigateBack, onNavigateToLogin }) => {
    const mainFeatures = [
        {
            icon: <Brain className="w-12 h-12" />,
            title: "AI-Powered Intelligence",
            description: "Advanced machine learning algorithms that understand construction workflows and optimize your projects automatically.",
            benefits: [
                "Predictive project analytics",
                "Automated task scheduling",
                "Risk assessment and mitigation",
                "Smart resource allocation"
            ]
        },
        {
            icon: <Building2 className="w-12 h-12" />,
            title: "Complete Project Management",
            description: "End-to-end construction project management with all the tools you need in one integrated platform.",
            benefits: [
                "RFI management and tracking",
                "Punch list creation and resolution",
                "Document management system",
                "Progress tracking and reporting"
            ]
        },
        {
            icon: <Zap className="w-12 h-12" />,
            title: "Real-time Collaboration",
            description: "Live collaboration tools with WebSocket technology for instant updates across your entire team.",
            benefits: [
                "Live document editing",
                "Instant notifications",
                "Team chat and messaging",
                "Real-time project updates"
            ]
        },
        {
            icon: <Shield className="w-12 h-12" />,
            title: "Enterprise Security",
            description: "Bank-level security with advanced encryption, role-based access control, and comprehensive audit logging.",
            benefits: [
                "JWT authentication",
                "Role-based permissions",
                "Data encryption at rest",
                "Comprehensive audit trails"
            ]
        },
        {
            icon: <BarChart3 className="w-12 h-12" />,
            title: "Advanced Analytics",
            description: "Powerful analytics and reporting tools that provide deep insights into project performance and profitability.",
            benefits: [
                "Custom dashboard creation",
                "Performance metrics tracking",
                "Cost analysis and forecasting",
                "ROI optimization insights"
            ]
        },
        {
            icon: <Globe className="w-12 h-12" />,
            title: "Global Marketplace",
            description: "Access to thousands of construction apps and integrations through our comprehensive global marketplace.",
            benefits: [
                "Third-party app integrations",
                "Custom workflow builders",
                "API access and SDKs",
                "Developer ecosystem"
            ]
        }
    ];

    const additionalFeatures = [
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Mobile-First Design",
            description: "Fully responsive design that works perfectly on all devices, from smartphones to desktop computers."
        },
        {
            icon: <Cloud className="w-8 h-8" />,
            title: "Cloud Infrastructure",
            description: "Scalable cloud infrastructure with 99.9% uptime guarantee and automatic backups."
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Document Management",
            description: "Centralized document storage with version control, sharing, and collaboration features."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Time Tracking",
            description: "Comprehensive time tracking with automated timesheets and project cost calculations."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Team Management",
            description: "Advanced team management with role assignments, permissions, and performance tracking."
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Goal Setting",
            description: "Set and track project goals with milestone management and progress visualization."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onNavigateBack}
                                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    CortexBuild
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onNavigateToLogin}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-blue-600 font-medium">Comprehensive Feature Set</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Everything You Need to
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Build Better
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover the powerful features that make CortexBuild the most advanced 
                            construction management platform available today.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Features */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {mainFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="text-blue-600 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {feature.description}
                                </p>
                                <ul className="space-y-3">
                                    {feature.benefits.map((benefit, benefitIndex) => (
                                        <li key={benefitIndex} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-20 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            And Much More
                        </h2>
                        <p className="text-xl text-gray-600">
                            Additional features that make your construction projects more efficient.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {additionalFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                                <div className="text-blue-600 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Experience These Features?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Start your free trial today and see how CortexBuild can transform your construction business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onNavigateToLogin}
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={onNavigateBack}
                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FeaturesPage;
