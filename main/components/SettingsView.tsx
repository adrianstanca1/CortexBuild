
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Role, Company, CompanySettings, LocationPreferences, NotificationPreferences, Permission } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { Tag } from './ui/Tag';
import { hasPermission } from '../services/auth';
import { Avatar } from './ui/Avatar';

interface SettingsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    description?: string;
    action: 'arrow' | React.ReactNode;
    onClick?: () => void;
}> = ({ icon, label, description, action, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center p-3 rounded-lg ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}
    >
        <div className="mr-4 text-slate-500">{icon}</div>
        <div className="flex-grow">
            <p className="font-medium">{label}</p>
            {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        <div>
            {action === 'arrow' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            ) : action}
        </div>
    </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ user, addToast, theme, setTheme }) => {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const canManageCompanySettings = hasPermission(user, Permission.MANAGE_TEAM);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!user.companyId) {
                setIsLoading(false);
                return;
            }
            const settingsData = await api.getCompanySettings(user.companyId);
            setSettings(settingsData);
        } catch (error) {
            addToast("Failed to load settings.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSettingsUpdate = async (updates: Partial<CompanySettings>) => {
        if (!user.companyId || !settings) return;
        
        const originalSettings = { ...settings };
        const newSettings = { ...settings, ...updates };
        if(updates.notificationPreferences) {
            newSettings.notificationPreferences = { ...settings.notificationPreferences, ...updates.notificationPreferences };
        }
        if(updates.locationPreferences) {
            newSettings.locationPreferences = { ...settings.locationPreferences, ...updates.locationPreferences };
        }
        setSettings(newSettings);

        try {
            await api.updateCompanySettings(user.companyId, newSettings, user.id);
            addToast("Settings updated.", "success");
        } catch (error) {
            setSettings(originalSettings);
            addToast("Failed to save settings.", "error");
        }
    };

    const handleThemeChange = async (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        await handleSettingsUpdate({ theme: newTheme });
    };

    const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
        const newPrefs = { ...settings?.notificationPreferences, [key]: value };
        handleSettingsUpdate({ notificationPreferences: newPrefs as NotificationPreferences });
    };

    const handleLocationChange = (key: keyof LocationPreferences, value: any) => {
        const newPrefs = { ...settings?.locationPreferences, [key]: value };
        handleSettingsUpdate({ locationPreferences: newPrefs as LocationPreferences });
    };

    if (isLoading) {
        return <Card><p>Loading settings...</p></Card>;
    }
    
    const notifPrefs = settings?.notificationPreferences;
    const locPrefs = settings?.locationPreferences;

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Settings</h2>
            <div className="space-y-8">
                {/* Profile Card */}
                <Card className="flex items-center gap-4">
                    <Avatar name={user.name} className="w-16 h-16 text-2xl"/>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <Tag label={user.role} color="blue" />
                        </div>
                        <p className="text-slate-500">{user.email}</p>
                    </div>
                </Card>

                {/* Personal Settings */}
                <Card>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Personal Settings</h3>
                    <div className="divide-y divide-slate-200">
                        <SettingsRow
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                            label="Dark Mode"
                            action={<ToggleSwitch checked={theme === 'dark'} onChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')} />}
                        />
                         <SettingsRow
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            label="Security"
                            description="Change password, enable 2FA"
                            action="arrow"
                        />
                    </div>
                </Card>

                {/* Notification Settings */}
                {settings && notifPrefs && (
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Notification Settings</h3>
                         <div className="divide-y divide-slate-200">
                            <SettingsRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                                label="Project Updates"
                                description="Get notified about major project changes."
                                action={<ToggleSwitch checked={notifPrefs.projectUpdates} onChange={v => handleNotificationChange('projectUpdates', v)} />}
                            />
                             <SettingsRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                label="Time Clock Reminders"
                                description="Reminders to clock out if still active after 10 hours."
                                action={<ToggleSwitch checked={notifPrefs.timeReminders} onChange={v => handleNotificationChange('timeReminders', v)} />}
                            />
                             <SettingsRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                label="Photo Requirements"
                                description="Get reminders if photos are required for clock-in/out."
                                action={<ToggleSwitch checked={notifPrefs.photoRequirements} onChange={v => handleNotificationChange('photoRequirements', v)} />}
                            />
                        </div>
                    </Card>
                )}

                {/* Company Settings */}
                {canManageCompanySettings && settings && locPrefs && (
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Company Settings</h3>
                        <div className="divide-y divide-slate-200">
                             <h4 className="font-semibold text-slate-600 text-sm pt-4 pb-2">Location Tracking</h4>
                             <SettingsRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                                label="Background Location Tracking"
                                description="Allow app to track operative location when not in use."
                                action={<ToggleSwitch checked={locPrefs.backgroundTracking} onChange={v => handleLocationChange('backgroundTracking', v)} />}
                            />
                            <div className="flex items-center p-3">
                                <div className="mr-4 text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium">GPS Accuracy</p>
                                </div>
                                <select value={locPrefs.gpsAccuracy} onChange={e => handleLocationChange('gpsAccuracy', e.target.value)} className="p-1 border rounded-md text-sm bg-white">
                                    <option value="standard">Standard</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
