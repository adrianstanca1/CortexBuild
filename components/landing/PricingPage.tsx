import React from 'react';
import { 
    Brain, 
    ArrowLeft, 
    CheckCircle, 
    X, 
    Sparkles, 
    Crown, 
    Zap,
    Building2,
    Users,
    Shield
} from 'lucide-react';

interface PricingPageProps {
    onNavigateBack: () => void;
    onNavigateToLogin: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateBack, onNavigateToLogin }) => {
    const plans = [
        {
            name: "Starter",
            price: "Free",
            period: "Forever",
            description: "Perfect for small teams getting started with construction management",
            icon: <Building2 className="w-8 h-8" />,
            color: "from-gray-600 to-gray-700",
            features: [
                "Up to 3 projects",
                "5 team members",
                "Basic project management",
                "Document storage (1GB)",
                "Email support",
                "Mobile app access"
            ],
            limitations: [
                "No AI features",
                "Limited integrations",
                "Basic reporting"
            ],
            cta: "Get Started Free",
            popular: false
        },
        {
            name: "Professional",
            price: "$29",
            period: "per user/month",
            description: "Advanced features for growing construction businesses",
            icon: <Zap className="w-8 h-8" />,
            color: "from-blue-600 to-purple-600",
            features: [
                "Unlimited projects",
                "Unlimited team members",
                "AI-powered insights",
                "Advanced analytics",
                "Document storage (100GB)",
                "Priority support",
                "Custom integrations",
                "Advanced reporting",
                "Real-time collaboration",
                "Mobile app access"
            ],
            limitations: [],
            cta: "Start Free Trial",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "Contact us",
            description: "Tailored solutions for large construction enterprises",
            icon: <Crown className="w-8 h-8" />,
            color: "from-purple-600 to-pink-600",
            features: [
                "Everything in Professional",
                "Custom AI model training",
                "Dedicated account manager",
                "On-premise deployment",
                "Custom integrations",
                "Advanced security features",
                "SLA guarantees",
                "24/7 phone support",
                "Custom training sessions",
                "White-label options"
            ],
            limitations: [],
            cta: "Contact Sales",
            popular: false
        }
    ];

    const faqs = [
        {
            question: "Can I change plans at any time?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
        },
        {
            question: "Is there a free trial?",
            answer: "Yes, we offer a 14-day free trial of our Professional plan with no credit card required. You can also use our Starter plan for free forever."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay by invoice."
        },
        {
            question: "Do you offer discounts for annual billing?",
            answer: "Yes, we offer a 20% discount when you pay annually. This applies to both Professional and Enterprise plans."
        },
        {
            question: "Can I cancel at any time?",
            answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period."
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
                            <span className="text-blue-600 font-medium">Simple, Transparent Pricing</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Choose Your
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Perfect Plan
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Start free and scale as you grow. No hidden fees, no surprises. 
                            Cancel anytime with no questions asked.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div 
                                key={index} 
                                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                                    plan.popular ? 'ring-4 ring-blue-600 scale-105' : ''
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-8">
                                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${plan.color} text-white mb-6`}>
                                        {plan.icon}
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    
                                    <p className="text-gray-600 mb-6">
                                        {plan.description}
                                    </p>
                                    
                                    <div className="mb-8">
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-black text-gray-900">
                                                {plan.price}
                                            </span>
                                            {plan.period !== "Contact us" && (
                                                <span className="text-gray-600 ml-2">
                                                    {plan.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={onNavigateToLogin}
                                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 mb-8 ${
                                            plan.popular 
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl' 
                                                : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                                        }`}
                                    >
                                        {plan.cta}
                                    </button>
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">What's included:</h4>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {plan.limitations.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-gray-900 mt-6">Limitations:</h4>
                                                <ul className="space-y-3">
                                                    {plan.limitations.map((limitation, limitationIndex) => (
                                                        <li key={limitationIndex} className="flex items-start">
                                                            <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700">{limitation}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to know about our pricing and plans.
                        </p>
                    </div>
                    
                    <div className="space-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
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
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of construction professionals who trust CortexBuild to manage their projects.
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

export default PricingPage;
