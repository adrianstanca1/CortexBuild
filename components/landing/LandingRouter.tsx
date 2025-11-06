import React, { useState } from 'react';
import { User } from '../../types';
import HomePage from './HomePage';
import FeaturesPage from './FeaturesPage';
import PricingPage from './PricingPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import AuthScreen from '../screens/AuthScreen';

interface LandingRouterProps {
    onLoginSuccess: (user: User) => void;
}

type LandingPage = 'home' | 'features' | 'pricing' | 'about' | 'contact' | 'login';

const LandingRouter: React.FC<LandingRouterProps> = ({ onLoginSuccess }) => {
    const [currentPage, setCurrentPage] = useState<LandingPage>('home');

    const navigateToPage = (page: LandingPage) => {
        setCurrentPage(page);
        // Scroll to top when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navigateToLogin = () => {
        setCurrentPage('login');
    };

    const navigateBack = () => {
        setCurrentPage('home');
    };

    // Render the appropriate page based on current route
    switch (currentPage) {
        case 'features':
            return (
                <FeaturesPage 
                    onNavigateBack={navigateBack}
                    onNavigateToLogin={navigateToLogin}
                />
            );

        case 'pricing':
            return (
                <PricingPage 
                    onNavigateBack={navigateBack}
                    onNavigateToLogin={navigateToLogin}
                />
            );

        case 'about':
            return (
                <AboutPage 
                    onNavigateBack={navigateBack}
                    onNavigateToLogin={navigateToLogin}
                />
            );

        case 'contact':
            return (
                <ContactPage 
                    onNavigateBack={navigateBack}
                    onNavigateToLogin={navigateToLogin}
                />
            );

        case 'login':
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto">
                        <AuthScreen onLoginSuccess={onLoginSuccess} />
                        <div className="text-center mt-6">
                            <button
                                onClick={navigateBack}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'home':
        default:
            return (
                <HomePage 
                    onNavigateToLogin={navigateToLogin}
                    onNavigateToPage={(page: string) => navigateToPage(page as LandingPage)}
                />
            );
    }
};

export default LandingRouter;
