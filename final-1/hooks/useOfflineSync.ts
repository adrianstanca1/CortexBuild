import React, { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { processOfflineQueue } from '../services/mockApi';

export const useOfflineSync = (addToast: (message: string, type: 'success' | 'error') => void) => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    const syncOfflineActions = useCallback(async () => {
        const { successCount, movedToFailedCount } = await processOfflineQueue();

        if (successCount > 0) {
            addToast(`Successfully synced ${successCount} offline action(s). Your data is now up-to-date.`, 'success');
        }

        if (movedToFailedCount > 0) {
            addToast(`${movedToFailedCount} action(s) failed to sync after multiple attempts. You can review them in Settings.`, 'error');
        }
    }, [addToast]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            addToast('You are back online.', 'success');
            syncOfflineActions();
        };

        const handleOffline = () => {
            setIsOnline(false);
            addToast('You are now offline. Changes will be saved locally and synced later.', 'error');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check in case there's a queue from a previous session
        if (navigator.onLine) {
            syncOfflineActions();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast, syncOfflineActions]);

    return { isOnline };
};
