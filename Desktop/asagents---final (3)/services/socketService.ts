// services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string): void {
        console.log("Socket connection deferred until backend is live.");
        // In a real application, the URL would be the backend server address.
        // For development, it connects to the same host.
        /*
        this.socket = io({
            auth: {
                token: `Bearer ${token}`
            }
        });

        this.socket.on('connect', () => {
            console.log('Socket.IO connected successfully.');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected:', reason);
            this.socket = null;
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err.message);
        });
        */
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on<T>(event: string, callback: (data: T) => void): void {
        if (!this.socket) {
            // console.warn(`Socket not connected. Cannot listen to event: ${event}`);
            return;
        }
        this.socket.on(event, callback);
    }

    off(event: string): void {
        if (!this.socket) {
            return;
        }
        this.socket.off(event);
    }

    emit<T>(event: string, data: T): void {
        if (!this.socket) {
            // console.warn(`Socket not connected. Cannot emit event: ${event}`);
            return;
        }
        this.socket.emit(event, data);
    }
}

// Export a singleton instance of the service
export const socketService = new SocketService();