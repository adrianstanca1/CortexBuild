import React, { useState, useEffect, useCallback } from 'react';
import { User, CompanySettings } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { getFailedSyncActions, retryFailedAction, discardFailedAction, formatFailedActionForUI, FailedActionForUI } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui/Avatar';

interface SettingsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  settings: CompanySettings | null;
  onSettingsUpdate: (updatedSettings: Partial<CompanySettings>) => void;
}

const FailedSyncActions: React.FC<{ addToast: (m:string,t:'success'|'error')=>void }> = ({ addToast }) => {
    const [failedActions, setFailedActions] = useState<FailedActionForUI[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFailedActions = useCallback(() => {
        const actions = getFailedSyncActions().map(formatFailedActionForUI);
        setFailedActions(actions);
    }, []);
    
    useEffect(() => {
        loadFailedActions();
        const interval = setInterval(loadFailedActions, 5000);
        return () => clearInterval(interval);
    }, [loadFailedActions]);

    const handleRetry = async (id: number) => {
        setIsLoading(true);
        try {
            await retryFailedAction(id);
            addToast("Retrying action...", "success");
        } catch (error) {
             addToast("Retry failed immediately.", "error");
        }
        loadFailedActions();
        setIsLoading(false);
    };
    
    const handleDiscard = (id: number) => {
        discardFailedAction(id);
        addToast("Action discarded.", "success");
        loadFailedActions();
    };

    if (failedActions.length === 0) {
        return null;
    }

    return (
        <Card>
            <h3 className="font-bold text-lg text-destructive">Offline Sync Issues</h3>
            <p className="text-sm text-muted-foreground mb-4">The following actions failed to sync with the server. You can retry them or discard them if they are no longer needed.</p>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {failedActions.map(action => (
                    <div key={action.id} className="p-3 border rounded-md bg-destructive/5 dark:bg-destructive/10">
                        <p className="font-semibold break-all text-sm">{action.summary}</p>
                        <p className="text-sm text-destructive">{action.error}</p>
                        <p className="text-xs text-muted-foreground">Failed at: {action.timestamp}</p>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="secondary" onClick={() => handleDiscard(action.id)} disabled={isLoading}>Discard</Button>
                            <Button size="sm" variant="primary" onClick={() => handleRetry(action.id)} isLoading={isLoading}>Retry</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const UserProfileSettings: React.FC<{ user: User, addToast: (m:string,t:'success'|'error')=>void }> = ({ user, addToast }) => {
    const { updateUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        avatar: user.avatar || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            avatar: user.avatar || '',
        });
    }, [user]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required.";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleAvatarUpload = () => {
        // Mock avatar upload by cycling through a few images
        const newAvatarId = Math.floor(Math.random() * 100);
        const newAvatarUrl = `https://i.pravatar.cc/150?u=${user.id}-${newAvatarId}`;
        setFormData(prev => ({...prev, avatar: newAvatarUrl}));
        addToast("Profile picture updated. Save changes to confirm.", "success");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            addToast("Please correct the errors before saving.", "error");
            return;
        }
        setIsSaving(true);
        try {
            await updateUserProfile({
                id: user.id,
                ...formData
            });
            addToast("Profile updated successfully!", "success");
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to update profile.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
         <Card>
            <h3 className="font-bold text-lg mb-4">My Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="flex items-center gap-6">
                    <Avatar name={`${formData.firstName} ${formData.lastName}`} imageUrl={formData.avatar} className="w-24 h-24 text-3xl"/>
                    <div>
                        <Button type="button" variant="secondary" onClick={handleAvatarUpload}>Upload Photo</Button>
                        <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, 200x200px</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">First Name</label>
                        <input value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} className={`w-full p-2 border rounded ${errors.firstName ? 'border-destructive' : 'border-border'}`}/>
                        {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Last Name</label>
                        <input value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} className={`w-full p-2 border rounded ${errors.lastName ? 'border-destructive' : 'border-border'}`}/>
                         {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Email</label>
                        <p className="p-2 ">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full p-2 border rounded"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-muted-foreground">Role</label>
                        <p className="p-2 capitalize">{user.role.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" isLoading={isSaving}>Save Changes</Button>
                </div>
            </form>
        </Card>
    )
}

const CompanySettingsComponent: React.FC<{ settings: CompanySettings, onSettingsUpdate: (updatedSettings: Partial<CompanySettings>) => void }> = ({ settings, onSettingsUpdate }) => {
    
    const handleSettingsChange = (key: keyof CompanySettings, value: any) => {
        if (settings && (settings as any)[key] !== value) {
            onSettingsUpdate({ [key]: value });
        }
    };
    
    const handleAccessibilityChange = (key: keyof CompanySettings['accessibility'], value: any) => {
        if (settings && settings.accessibility && settings.accessibility[key] !== value) {
             onSettingsUpdate({
                accessibility: { ...settings.accessibility, [key]: value }
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="font-bold text-lg">Appearance</h3>
                <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <label htmlFor="theme">Theme</label>
                        <select
                            id="theme"
                            value={settings.theme}
                            onChange={(e) => handleSettingsChange('theme', e.target.value as 'light' | 'dark')}
                            className="p-2 border rounded bg-card"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                 <h3 className="font-bold text-lg">Accessibility</h3>
                 <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <label>
                            <p>High Contrast Mode</p>
                            <p className="text-sm text-muted-foreground">Increases text and UI element contrast.</p>
                        </label>
                        <ToggleSwitch 
                            checked={settings.accessibility.highContrast} 
                            onChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                        />
                    </div>
                 </div>
            </Card>
        </div>
    );
};


export const SettingsView: React.FC<SettingsViewProps> = ({ user, addToast, settings, onSettingsUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');

    if (!settings) {
        return <Card><p>Loading settings...</p></Card>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground">Settings</h2>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        My Profile
                    </button>
                    <button onClick={() => setActiveTab('company')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'company' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        Company
                    </button>
                </nav>
            </div>

            {activeTab === 'profile' && (
                <UserProfileSettings user={user} addToast={addToast} />
            )}
            
            {activeTab === 'company' && (
                <div className="space-y-6">
                    <CompanySettingsComponent settings={settings} onSettingsUpdate={onSettingsUpdate} />
                    <FailedSyncActions addToast={addToast} />
                </div>
            )}
        </div>
    );
};