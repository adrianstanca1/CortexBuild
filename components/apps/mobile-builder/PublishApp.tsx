/**
 * Publish App - Publishing and distribution system
 */

import React, { useState } from 'react';
import {
    Upload,
    Download,
    Share2,
    Package,
    CheckCircle,
    Loader,
    DollarSign,
    Users,
    Globe,
    Lock,
    Star,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PublishAppProps {
    isDarkMode?: boolean;
    appName: string;
    appIcon: string;
    appDescription: string;
}

const PublishApp: React.FC<PublishAppProps> = ({ 
    isDarkMode = true, 
    appName, 
    appIcon, 
    appDescription 
}) => {
    const [publishType, setPublishType] = useState<'marketplace' | 'download' | 'private'>('marketplace');
    const [pricing, setPricing] = useState<'free' | 'paid'>('free');
    const [price, setPrice] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const publishToMarketplace = async () => {
        setIsPublishing(true);
        toast.loading('Publishing to marketplace...');

        // Simulate publishing
        await new Promise(resolve => setTimeout(resolve, 3000));

        setIsPublishing(false);
        setIsPublished(true);
        toast.dismiss();
        toast.success('App published successfully!');
    };

    const downloadStandalone = () => {
        toast.success('Downloading standalone package...');
        // Simulate download
        setTimeout(() => {
            toast.success('Download complete!');
        }, 1500);
    };

    const shareApp = () => {
        navigator.clipboard.writeText(`https://cortexbuild.io/apps/${appName.toLowerCase().replace(/\s+/g, '-')}`);
        toast.success('Share link copied to clipboard!');
    };

    return (
        <div className="h-full">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Publish Your App
                    </h2>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Choose how you want to distribute your application
                    </p>
                </div>

                {/* Publishing Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        type="button"
                        onClick={() => setPublishType('marketplace')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            publishType === 'marketplace'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                                : isDarkMode 
                                    ? 'border-gray-700 bg-gray-700 hover:border-gray-600' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <Globe className={`h-12 w-12 mb-4 ${publishType === 'marketplace' ? 'text-white' : isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h3 className={`text-xl font-bold mb-2 ${publishType === 'marketplace' ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Marketplace
                        </h3>
                        <p className={`text-sm ${publishType === 'marketplace' ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Publish to CortexBuild marketplace for all users
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPublishType('download')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            publishType === 'download'
                                ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                                : isDarkMode 
                                    ? 'border-gray-700 bg-gray-700 hover:border-gray-600' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <Download className={`h-12 w-12 mb-4 ${publishType === 'download' ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h3 className={`text-xl font-bold mb-2 ${publishType === 'download' ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Download
                        </h3>
                        <p className={`text-sm ${publishType === 'download' ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Export as standalone package for offline use
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPublishType('private')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            publishType === 'private'
                                ? 'border-green-500 bg-gradient-to-br from-green-600 to-emerald-600 text-white'
                                : isDarkMode 
                                    ? 'border-gray-700 bg-gray-700 hover:border-gray-600' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <Lock className={`h-12 w-12 mb-4 ${publishType === 'private' ? 'text-white' : isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <h3 className={`text-xl font-bold mb-2 ${publishType === 'private' ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Private
                        </h3>
                        <p className={`text-sm ${publishType === 'private' ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Keep private for your company only
                        </p>
                    </button>
                </div>

                {/* Publishing Details */}
                {publishType === 'marketplace' && (
                    <div className={`p-6 rounded-2xl border mb-8 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Marketplace Settings
                        </h3>

                        {/* Pricing */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Pricing Model
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPricing('free')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                                        pricing === 'free'
                                            ? 'border-green-500 bg-green-500/10'
                                            : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className={`h-5 w-5 ${pricing === 'free' ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={`font-semibold ${pricing === 'free' ? 'text-green-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Free
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Available to all users
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPricing('paid')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                                        pricing === 'paid'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className={`h-5 w-5 ${pricing === 'paid' ? 'text-purple-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={`font-semibold ${pricing === 'paid' ? 'text-purple-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Paid
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Set a price for your app
                                    </p>
                                </button>
                            </div>
                        </div>

                        {pricing === 'paid' && (
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Price (USD)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="9.99"
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        isDarkMode 
                                            ? 'bg-gray-700 text-white border-gray-600' 
                                            : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                            </div>
                        )}

                        {/* App Preview */}
                        <div className={`p-6 rounded-xl border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <h4 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Marketplace Preview
                            </h4>
                            <div className="flex items-start gap-4">
                                <div className="text-5xl">{appIcon}</div>
                                <div className="flex-1">
                                    <h5 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {appName}
                                    </h5>
                                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {appDescription}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                New
                                            </span>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-semibold rounded-full">
                                            {pricing === 'free' ? 'FREE' : `$${price || '0.00'}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    {publishType === 'marketplace' && (
                        <button
                            type="button"
                            onClick={publishToMarketplace}
                            disabled={isPublishing || isPublished}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader className="h-5 w-5 animate-spin" />
                                    Publishing...
                                </>
                            ) : isPublished ? (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Published
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5" />
                                    Publish to Marketplace
                                </>
                            )}
                        </button>
                    )}

                    {publishType === 'download' && (
                        <button
                            type="button"
                            onClick={downloadStandalone}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all"
                        >
                            <Package className="h-5 w-5" />
                            Download Standalone Package
                        </button>
                    )}

                    {publishType === 'private' && (
                        <button
                            type="button"
                            onClick={publishToMarketplace}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                        >
                            <Lock className="h-5 w-5" />
                            Deploy to Company
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={shareApp}
                        className={`px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                    >
                        <Share2 className="h-5 w-5" />
                        Share
                    </button>
                </div>

                {isPublished && (
                    <div className={`mt-6 p-6 rounded-xl border ${
                        isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-lg font-bold text-green-500 mb-2">
                                    App Published Successfully!
                                </h4>
                                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Your app is now live in the CortexBuild marketplace and available to all users.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            0 downloads
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            No ratings yet
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishApp;

