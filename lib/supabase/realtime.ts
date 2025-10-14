// Minimal realtime helpers used by hooks

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  table?: string;
}

type Handlers = {
  onProject?: (payload: RealtimePayload) => void;
  onNotification?: (payload: RealtimePayload) => void;
  onCognitive?: (payload: RealtimePayload) => void;
  onAction?: (payload: RealtimePayload) => void;
  onInvoice?: (payload: RealtimePayload) => void;
};

export function subscribeToMultiple(
  _companyId: string,
  _userId: string,
  _handlers: Handlers
): any[] {
  // Return empty channel list in stub mode
  return [];
}

export function unsubscribeFromMultiple(_channels: any[]): void {
  // no-op in stub
}

