// @ts-nocheck


import React, { useState } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Grant } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FundingBotProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

export const FundingBot: React.FC<FundingBotProps> = ({ user, addToast, onBack }) => {
    const [keywords, setKeywords] = useState('');
    const [location, setLocation] = useState('UK');
    const [isLoading, setIsLoading] = useState(false);
    const [grants, setGrants] = useState<Grant[] | null>(null);

    const handleFindGrants = async () => {
        if (!keywords.trim() || !location.trim()) {
            addToast('Please provide both keywords and a location.', 'error');
            return;
        }
        setIsLoading(true);
        setGrants(null);
        try {
            const results = await api.findGrants(keywords, location);
            setGrants(results);
            addToast(`Found ${results.length} potential grants.`, 'success');
        } catch (error) {
            addToast('Failed to fetch grants from AI.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">FundingBot</h3>
            <p className="text-sm text-slate-500 mb-4">Discover grants and funding opportunities for your construction projects.</p>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                    <input
                        type="text"
                        id="keywords"
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)}
                        placeholder="e.g. retrofit, SME, green energy"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <Button onClick={handleFindGrants} isLoading={isLoading}>Find Grants</Button>
            </div>

            <div className="mt-6">
                {grants === null && !isLoading && (
                     <p className="text-center text-slate-500 py-4">No results yet. Try a search.</p>
                )}
                {grants && grants.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No matching grants found for your search.</p>
                )}
                {grants && grants.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Funding Opportunities Found:</h4>
                        {grants.map(grant => (
                            <div key={grant.id} className="p-4 border rounded-md">
                                <h5 className="font-semibold text-green-700">{grant.name}</h5>
                                <p className="text-sm font-medium text-slate-600">{grant.agency} - {grant.amount}</p>
                                <p className="text-sm text-slate-500 mt-2">{grant.description}</p>
                                <a href={grant.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline mt-2 inline-block">Learn More &rarr;</a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};