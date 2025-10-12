import React from 'react';
import { 
    Brain, 
    ArrowLeft, 
    Users, 
    Target, 
    Award, 
    Sparkles,
    Building2,
    Globe,
    TrendingUp,
    Heart,
    Lightbulb,
    Shield
} from 'lucide-react';

interface AboutPageProps {
    onNavigateBack: () => void;
    onNavigateToLogin: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigateBack, onNavigateToLogin }) => {
    const values = [
        {
            icon: <Lightbulb className="w-8 h-8" />,
            title: "Innovation",
            description: "We constantly push the boundaries of what's possible in construction technology, bringing cutting-edge AI solutions to the industry."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Collaboration",
            description: "We believe that great construction projects are built by great teams working together seamlessly."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Reliability",
            description: "Our platform is built to be dependable, secure, and always available when you need it most."
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Customer Success",
            description: "Your success is our success. We're committed to helping you achieve your construction goals."
        }
    ];

    const team = [
        {
            name: "Adrian Stanca",
            role: "Founder & CEO",
            description: "Visionary leader with 15+ years in construction technology and AI development.",
            image: "👨‍💼"
        },
        {
            name: "Sarah Johnson",
            role: "CTO",
            description: "Technical architect behind our AI-powered construction intelligence platform.",
            image: "👩‍💻"
        },
        {
            name: "Mike Chen",
            role: "Head of Product",
            description: "Product strategist focused on creating intuitive construction management experiences.",
            image: "👨‍🔬"
        },
        {
            name: "Emily Rodriguez",
            role: "Head of Engineering",
            description: "Engineering leader ensuring our platform scales to meet growing demands.",
            image: "👩‍🔧"
        }
    ];

    const stats = [
        { number: "2019", label: "Founded" },
        { number: "500+", label: "Companies" },
        { number: "10,000+", label: "Projects" },
        { number: "50+", label: "Team Members" }
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
                            <span className="text-blue-600 font-medium">Our Story</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Building the Future of
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Construction
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We're on a mission to revolutionize the construction industry with AI-powered 
                            intelligence that makes building smarter, faster, and more efficient.
                        </p>
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

            {/* Mission Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                We believe that construction is one of the world's most important industries, 
                                yet it remains one of the least digitized. Our mission is to change that by 
                                bringing cutting-edge AI and technology to construction professionals everywhere.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                From small contractors to large enterprises, we're democratizing access to 
                                enterprise-level construction management tools, making them affordable and 
                                accessible to businesses of all sizes.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                            <Building2 className="w-16 h-16 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">
                                Transforming Construction
                            </h3>
                            <p className="text-blue-100 leading-relaxed">
                                We're not just building software – we're building the future of construction. 
                                Every feature we develop is designed to solve real problems that construction 
                                professionals face every day.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600">
                            The principles that guide everything we do.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 text-center">
                                <div className="text-blue-600 mb-4 flex justify-center">
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-xl text-gray-600">
                            The passionate people behind CortexBuild.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 text-center">
                                <div className="text-6xl mb-4">
                                    {member.image}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-blue-600 font-medium mb-3">
                                    {member.role}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {member.description}
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
                        Join Our Mission
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Be part of the construction technology revolution. Start building smarter today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onNavigateToLogin}
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200"
                        >
                            Get Started
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

export default AboutPage;
