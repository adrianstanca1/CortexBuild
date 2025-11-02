import React, { useState } from 'react';
import { 
    Brain, 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    Send,
    Sparkles,
    MessageCircle,
    Users,
    Building2,
    CheckCircle
} from 'lucide-react';

interface ContactPageProps {
    onNavigateBack: () => void;
    onNavigateToLogin: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigateBack, onNavigateToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log('Form submitted:', formData);
        setIsSubmitted(true);
    };

    const contactInfo = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email",
            content: "hello@cortexbuild.com",
            description: "Send us an email anytime"
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Phone",
            content: "+1 (555) 123-4567",
            description: "Mon-Fri from 8am to 6pm"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Office",
            content: "San Francisco, CA",
            description: "Come say hello at our HQ"
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Support Hours",
            content: "24/7 Support",
            description: "We're here when you need us"
        }
    ];

    const reasons = [
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "General Inquiries",
            description: "Questions about our platform, features, or how we can help your business."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Sales & Demos",
            description: "Interested in a demo or discussing pricing for your team or organization."
        },
        {
            icon: <Building2 className="w-8 h-8" />,
            title: "Enterprise Solutions",
            description: "Custom solutions, integrations, and enterprise-level support options."
        }
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Message Sent!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Thank you for reaching out. We'll get back to you within 24 hours.
                        </p>
                        <button
                            onClick={onNavigateBack}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                            <span className="text-blue-600 font-medium">Get in Touch</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Let's Build
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Something Great
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Have questions about CortexBuild? Want to see a demo? 
                            We'd love to hear from you and help you get started.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Reasons */}
            <section className="py-16 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reasons.map((reason, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 text-center">
                                <div className="text-blue-600 mb-4 flex justify-center">
                                    {reason.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {reason.title}
                                </h3>
                                <p className="text-gray-600">
                                    {reason.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Send us a message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        placeholder="Your company"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="demo">Request Demo</option>
                                        <option value="sales">Sales Question</option>
                                        <option value="support">Technical Support</option>
                                        <option value="enterprise">Enterprise Solutions</option>
                                        <option value="partnership">Partnership</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    Send Message
                                    <Send className="w-5 h-5 ml-2" />
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Get in touch
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    We're here to help and answer any question you might have. 
                                    We look forward to hearing from you.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <div className="text-blue-600">
                                                {info.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {info.title}
                                            </h3>
                                            <p className="text-lg text-gray-900 mb-1">
                                                {info.content}
                                            </p>
                                            <p className="text-gray-600">
                                                {info.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Don't wait – start building smarter construction projects today.
                    </p>
                    <button
                        onClick={onNavigateToLogin}
                        className="bg-white text-blue-600 px-12 py-4 rounded-xl font-semibold text-xl hover:shadow-xl transition-all duration-200"
                    >
                        Start Your Free Trial
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
