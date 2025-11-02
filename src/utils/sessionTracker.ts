/**
 * Session Tracker
 * Tracks user sessions and journeys
 */

import { SessionInfo } from '../types/errorTypes';
import { contextCollector } from './contextCollector';

/**
 * Session Tracker Class
 */
export class SessionTracker {
    private static instance: SessionTracker;
    private session: SessionInfo;
    private activityTimer: NodeJS.Timeout | null = null;
    private inactivityTimeout: number = 30 * 60 * 1000; // 30 minutes

    private constructor() {
        this.session = this.createSession();
        this.setupActivityTracking();
        this.setupBeforeUnload();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): SessionTracker {
        if (!SessionTracker.instance) {
            SessionTracker.instance = new SessionTracker();
        }
        return SessionTracker.instance;
    }

    /**
     * Get current session
     */
    public getSession(): SessionInfo {
        return { ...this.session };
    }

    /**
     * Get session ID
     */
    public getSessionId(): string {
        return this.session.sessionId;
    }

    /**
     * Update user ID
     */
    public setUserId(userId: string): void {
        this.session.userId = userId;
    }

    /**
     * Track page view
     */
    public trackPageView(route: string): void {
        this.session.pageViews++;
        this.session.route = route;
        this.updateActivity();

        contextCollector.addBreadcrumb({
            type: 'navigation',
            category: 'session',
            message: `Page view: ${route}`,
            data: {
                route,
                pageViews: this.session.pageViews,
                sessionDuration: this.getSessionDuration()
            },
            level: 'info'
        });
    }

    /**
     * Track user action
     */
    public trackAction(): void {
        this.session.actions++;
        this.updateActivity();
    }

    /**
     * Track error
     */
    public trackError(): void {
        this.session.errors++;
        this.updateActivity();
    }

    /**
     * Get session duration
     */
    public getSessionDuration(): number {
        return Date.now() - new Date(this.session.startTime).getTime();
    }

    /**
     * Get session summary
     */
    public getSessionSummary(): {
        sessionId: string;
        userId?: string;
        duration: number;
        pageViews: number;
        actions: number;
        errors: number;
        currentRoute: string;
    } {
        return {
            sessionId: this.session.sessionId,
            userId: this.session.userId,
            duration: this.getSessionDuration(),
            pageViews: this.session.pageViews,
            actions: this.session.actions,
            errors: this.session.errors,
            currentRoute: this.session.route
        };
    }

    /**
     * End current session and start new one
     */
    public endSession(): void {
        const summary = this.getSessionSummary();
        
        contextCollector.addBreadcrumb({
            type: 'custom',
            category: 'session',
            message: 'Session ended',
            data: summary,
            level: 'info'
        });

        // Create new session
        this.session = this.createSession();
    }

    /**
     * Create new session
     */
    private createSession(): SessionInfo {
        const sessionId = this.generateSessionId();
        const startTime = new Date().toISOString();

        return {
            sessionId,
            userId: undefined,
            startTime,
            lastActivity: startTime,
            duration: 0,
            pageViews: 1,
            actions: 0,
            errors: 0,
            route: window.location.pathname,
            referrer: document.referrer || undefined
        };
    }

    /**
     * Update last activity
     */
    private updateActivity(): void {
        this.session.lastActivity = new Date().toISOString();
        this.session.duration = this.getSessionDuration();

        // Reset inactivity timer
        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
        }

        this.activityTimer = setTimeout(() => {
            this.endSession();
        }, this.inactivityTimeout);
    }

    /**
     * Setup activity tracking
     */
    private setupActivityTracking(): void {
        // Track mouse movement
        let lastMouseMove = 0;
        document.addEventListener('mousemove', () => {
            const now = Date.now();
            if (now - lastMouseMove > 1000) {  // Throttle to 1 second
                this.trackAction();
                lastMouseMove = now;
            }
        }, { passive: true });

        // Track keyboard activity
        let lastKeyPress = 0;
        document.addEventListener('keypress', () => {
            const now = Date.now();
            if (now - lastKeyPress > 1000) {  // Throttle to 1 second
                this.trackAction();
                lastKeyPress = now;
            }
        }, { passive: true });

        // Track clicks
        document.addEventListener('click', () => {
            this.trackAction();
        }, { passive: true });

        // Track scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScroll > 1000) {  // Throttle to 1 second
                this.trackAction();
                lastScroll = now;
            }
        }, { passive: true });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                contextCollector.addBreadcrumb({
                    type: 'custom',
                    category: 'session',
                    message: 'Tab hidden',
                    data: this.getSessionSummary(),
                    level: 'info'
                });
            } else {
                this.updateActivity();
                contextCollector.addBreadcrumb({
                    type: 'custom',
                    category: 'session',
                    message: 'Tab visible',
                    data: this.getSessionSummary(),
                    level: 'info'
                });
            }
        });
    }

    /**
     * Setup beforeunload handler
     */
    private setupBeforeUnload(): void {
        window.addEventListener('beforeunload', () => {
            const summary = this.getSessionSummary();
            
            // Try to send session data
            if (navigator.sendBeacon) {
                const data = JSON.stringify({
                    type: 'session_end',
                    session: summary
                });
                
                // In production, send to analytics endpoint
                // navigator.sendBeacon('/api/analytics/session', data);
            }

            contextCollector.addBreadcrumb({
                type: 'custom',
                category: 'session',
                message: 'Page unload',
                data: summary,
                level: 'info'
            });
        });
    }

    /**
     * Generate session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}

/**
 * Export singleton instance
 */
export const sessionTracker = SessionTracker.getInstance();

/**
 * Convenience functions
 */
export const getSession = () => sessionTracker.getSession();
export const getSessionId = () => sessionTracker.getSessionId();
export const setUserId = (userId: string) => sessionTracker.setUserId(userId);
export const trackPageView = (route: string) => sessionTracker.trackPageView(route);
export const trackAction = () => sessionTracker.trackAction();
export const trackError = () => sessionTracker.trackError();
export const getSessionSummary = () => sessionTracker.getSessionSummary();

