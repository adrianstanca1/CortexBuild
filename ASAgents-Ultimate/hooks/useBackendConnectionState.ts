import { useSyncExternalStore } from 'react';
import type { BackendConnectionState } from '../types';
import { backendGateway } from '../services/backendGateway';

const subscribe = (onStoreChange: () => void) => backendGateway.subscribe(() => onStoreChange());

const getSnapshot = (): BackendConnectionState => backendGateway.getState();

export const useBackendConnectionState = (): BackendConnectionState =>
    useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
