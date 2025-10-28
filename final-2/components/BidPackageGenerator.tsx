import React, { useState } from 'react';
// FIX: Corrected import paths to be relative.
import { User, BidPackage } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BidPackageGeneratorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

export const BidPackageGenerator: React.FC<BidPackageGeneratorProps> = ({ user, addToast, onBack }) => {
    const [tenderUrl, setTenderUrl] = useState('');
    const [companyStrengths, setCompanyStrengths] = useState('');
    const [result, setResult] = useState<BidPackage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!companyStrengths.trim()) {
            addToast('Please provide your company strengths.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);

        try {
            const response = await api.generateBidPackage(tenderUrl, companyStrengths, user.id);
            setResult(response);
            addToast("Bid package generated!", "success");

        } catch (error) {
            console.error(error);
            addToast("Failed to generate bid package.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        addToast(`${section} copied to clipboard!`, 'success');
    };

    return (
        <Card>
            <p className="text-sm text-slate-500 mb-4">Provide a link to the tender document and list your company's key strengths to generate a draft bid package.</p>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="tender-url" className="block text-sm font-medium text-gray-700 mb-1">Tender Document URL (Optional)</label>
                    <input
                        id="tender-url"
                        type="url"
                        value={tenderUrl}
                        onChange={(e) => setTenderUrl(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="https://example.com/tender.pdf"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="company-strengths" className="block text-sm font-medium text-gray-700 mb-1">Company Strengths</label>
                    <textarea
                        id="company-strengths"
                        value={companyStrengths}
                        onChange={(e) => setCompanyStrengths(e.target.value)}
                        rows={4}
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., 'Specialists in sustainable building materials', '15 years of experience in high-rise construction', 'Excellent safety record'..."
                        disabled={isLoading}
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={!companyStrengths.trim()}>Generate Bid Package</Button>
            </div>
            
            {isLoading && (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                    <p className="mt-2 text-slate-600">AI is drafting your document...</p>
                </div>
            )}

            {result && (
                <div className="mt-6 pt-4 border-t animate-card-enter space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Executive Summary</h4>
                             <Button variant="secondary" size="sm" onClick={() => copyToClipboard(result.summary, 'Summary')}>Copy</Button>
                        </div>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap text-sm">
                            {result.summary}
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Cover Letter</h4>
                            <Button variant="secondary" size="sm" onClick={() => copyToClipboard(result.coverLetter, 'Cover Letter')}>Copy</Button>
                        </div>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap text-sm">
                            {result.coverLetter}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg mb-2">Submission Checklist</h4>
                        <ul className="list-disc list-inside p-4 border rounded-md bg-white space-y-2 text-sm">
                            {result.checklist.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};
