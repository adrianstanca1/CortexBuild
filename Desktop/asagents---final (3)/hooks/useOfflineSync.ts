import React, { useState, useEffect, useCallback } from 'react';

// A mock offline queue for demonstration purposes
const offlineQueue: { action: string; payload: any }[] = [];

export const useOfflineSync = (addToast: (message: string, type: 'success' | 'error') => void) => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    const processOfflineQueue = useCallback(async () => {
        if (offlineQueue.length > 0) {
            addToast(`Syncing ${offlineQueue.length} offline changes...`, 'success');
            // In a real app, you would iterate through the queue and make API calls.
            // For this mock, we'll just clear it and assume success.
            console.log('Processing offline queue:', offlineQueue);
            offlineQueue.length = 0; // Clear the array
            addToast('Offline changes synced!', 'success');
            // A real implementation might need to trigger a data refresh here.
        }
    }, [addToast]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            addToast('You are back online.', 'success');
            processOfflineQueue();
        };

        const handleOffline = () => {
            setIsOnline(false);
            addToast('You are now offline. Some actions will be queued.', 'error');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast, processOfflineQueue]);

    return { isOnline };
};