import React from 'react';
import { 
    Brain, 
    Zap, 
    Shield, 
    Users, 
    ArrowRight, 
    CheckCircle, 
    Star,
    Building2,
    Sparkles,
    Target,
    TrendingUp,
    Globe
} from 'lucide-react';

interface HomePageProps {
    onNavigateToLogin: () => void;
    onNavigateToPage: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin, onNavigateToPage }) => {
    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI-Powered Intelligence",
            description: "Advanced AI algorithms that understand construction workflows and optimize your projects automatically."
        },
        {
            icon: <Building2 className="w-8 h-8" />,
            title: "Construction Management",
            description: "Complete project management suite with RFIs, punch lists, time tracking, and document management."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Real-time Collaboration",
            description: "Live collaboration tools with WebSocket technology for instant updates across your entire team."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Enterprise Security",
            description: "Bank-level security with JWT authentication, role-based access control, and audit logging."
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Smart Analytics",
            description: "Powerful analytics and reporting tools that provide insights into project performance and profitability."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Marketplace",
            description: "Access to thousands of construction apps and integrations through our global marketplace."
        }
    ];

    const testimonials = [
        {
            name: "Adrian Stanca",
            role: "CEO, ASC Ladding Ltd",
            content: "CortexBuild transformed our construction operations. We've seen 40% improvement in project delivery times.",
            rating: 5
        },
        {
            name: "Sarah Johnson",
            role: "Project Manager, BuildCorp",
            content: "The AI-powered insights have revolutionized how we manage our construction projects. Absolutely game-changing.",
            rating: 5
        },
        {
            name: "Mike Chen",
            role: "Developer, TechBuild Solutions",
            content: "The SDK and developer tools are incredible. We've built custom integrations that perfectly fit our workflow.",
            rating: 5
        }
    ];

    const stats = [
        { number: "10,000+", label: "Active Projects" },
        { number: "500+", label: "Construction Companies" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    CortexBuild
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">AI INTELLIGENCE</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <button 
                                onClick={() => onNavigateToPage('features')}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                Features
                            </button>
                            <button 
                                onClick={() => onNavigateToPage('pricing')}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                Pricing
                            </button>
                            <button 
                                onClick={() => onNavigateToPage('about')}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                About
                            </button>
                            <button 
                                onClick={() => onNavigateToPage('contact')}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                Contact
                            </button>
                            <button
                                onClick={onNavigateToLogin}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-blue-600 font-medium">AI-Powered Construction Intelligence</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                            Build Smarter,
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Not Harder
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            The most advanced AI-powered construction management platform. 
                            Streamline projects, boost productivity, and deliver exceptional results.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onNavigateToLogin}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                            <button
                                onClick={() => onNavigateToPage('features')}
                                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage construction projects efficiently and intelligently.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                                <div className="text-blue-600 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Trusted by Industry Leaders
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            See what construction professionals are saying about CortexBuild.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-gray-600">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Ready to Transform Your Construction Business?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of construction professionals who are already building smarter with CortexBuild.
                    </p>
                    <button
                        onClick={onNavigateToLogin}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-xl hover:shadow-xl transition-all duration-200 inline-flex items-center"
                    >
                        Start Your Free Trial
                        <ArrowRight className="w-6 h-6 ml-3" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">CortexBuild</span>
                            </div>
                            <p className="text-gray-400">
                                AI-powered construction intelligence platform for the modern builder.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => onNavigateToPage('features')} className="hover:text-white transition-colors">Features</button></li>
                                <li><button onClick={() => onNavigateToPage('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                                <li><button onClick={() => onNavigateToPage('integrations')} className="hover:text-white transition-colors">Integrations</button></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => onNavigateToPage('about')} className="hover:text-white transition-colors">About</button></li>
                                <li><button onClick={() => onNavigateToPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
                                <li><button onClick={() => onNavigateToPage('careers')} className="hover:text-white transition-colors">Careers</button></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => onNavigateToPage('docs')} className="hover:text-white transition-colors">Documentation</button></li>
                                <li><button onClick={() => onNavigateToPage('help')} className="hover:text-white transition-colors">Help Center</button></li>
                                <li><button onClick={() => onNavigateToPage('status')} className="hover:text-white transition-colors">Status</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 CortexBuild. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
