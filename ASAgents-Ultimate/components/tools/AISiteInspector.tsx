

import React, { useState } from 'react';
// FIX: Corrected import paths to be relative.
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AISiteInspectorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

export const AISiteInspector: React.FC<AISiteInspectorProps> = ({ user, addToast, onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile) {
            addToast('Please select an image to analyze.', 'error');
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setAnalysis(
`**AI Site Inspection Report**
- **Progress:** Wall framing for the west wing appears to be ~75% complete, consistent with the project schedule.
- **Safety Concern (High):** An unsecured ladder is visible near gridline C-4. Immediate action required.
- **Observation:** Debris accumulation is noted in the staging area. Recommend cleanup to maintain a safe work environment.
- **Materials:** Stacks of drywall appear to be properly stored and covered.`
            );
            addToast('Site photo analysis complete.', 'success');
        } catch (error) {
            addToast('Failed to perform analysis.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Site Inspector</h3>
            <p className="text-sm text-slate-500 mb-4">Upload a photo from the site to automatically check progress and identify potential safety hazards.</p>
            
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div>
                    <label htmlFor="site-photo" className="block text-sm font-medium text-gray-700 mb-1">Site Photo</label>
                    <input
                        type="file"
                        id="site-photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                    />
                </div>
                {preview && (
                    <div className="mt-4">
                        <img src={preview} alt="Site preview" className="max-h-64 w-auto rounded-lg mx-auto" />
                    </div>
                )}
                <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!imageFile}>Analyze Photo</Button>
            </div>
            
            <div className="mt-6">
                {isLoading && (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-600">AI is inspecting your photo...</p>
                    </div>
                )}
                {analysis && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Analysis Result:</h4>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap font-mono text-sm">
                            {analysis}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
