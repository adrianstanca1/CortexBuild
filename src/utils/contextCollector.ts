/**
 * Context Collector
 * Collects rich context information for error logging
 */

import {
    BrowserInfo,
    NetworkInfo,
    PerformanceMetrics,
    StateSnapshot,
    Breadcrumb
} from '../types/errorTypes';

/**
 * Context Collector Class
 */
export class ContextCollector {
    private static instance: ContextCollector;
    private breadcrumbs: Breadcrumb[] = [];
    private maxBreadcrumbs: number = 50;

    private constructor() {
        this.setupAutoTracking();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): ContextCollector {
        if (!ContextCollector.instance) {
            ContextCollector.instance = new ContextCollector();
        }
        return ContextCollector.instance;
    }

    /**
     * Collect browser information
     */
    public collectBrowserInfo(): BrowserInfo {
        const ua = navigator.userAgent;

        return {
            name: this.detectBrowser(ua),
            version: this.detectBrowserVersion(ua),
            os: this.detectOS(ua),
            osVersion: this.detectOSVersion(ua),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === '1'
        };
    }

    /**
     * Collect network information
     */
    public collectNetworkInfo(): NetworkInfo {
        const connection = (navigator as any).connection || 
                          (navigator as any).mozConnection || 
                          (navigator as any).webkitConnection;

        return {
            online: navigator.onLine,
            effectiveType: connection?.effectiveType,
            downlink: connection?.downlink,
            rtt: connection?.rtt,
            saveData: connection?.saveData
        };
    }

    /**
     * Collect performance metrics
     */
    public collectPerformanceMetrics(): PerformanceMetrics {
        const metrics: PerformanceMetrics = {};

        // Navigation timing
        if (performance.timing) {
            const timing = performance.timing;
            metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        }

        // Paint timing
        if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
                metrics.firstContentfulPaint = fcp.startTime;
            }
        }

        // Memory usage (Chrome only)
        if ((performance as any).memory) {
            const memory = (performance as any).memory;
            metrics.memoryUsage = {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            };
        }

        return metrics;
    }

    /**
     * Collect application state snapshot
     */
    public collectStateSnapshot(): StateSnapshot {
        return {
            route: window.location.pathname,
            component: undefined,
            props: undefined,
            state: undefined,
            localStorage: this.getLocalStorageSafe(),
            sessionStorage: this.getSessionStorageSafe()
        };
    }

    /**
     * Add breadcrumb
     */
    public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
        this.breadcrumbs.push({
            ...breadcrumb,
            timestamp: new Date().toISOString()
        });

        // Keep only last N breadcrumbs
        if (this.breadcrumbs.length > this.maxBreadcrumbs) {
            this.breadcrumbs.shift();
        }
    }

    /**
     * Get breadcrumbs
     */
    public getBreadcrumbs(): Breadcrumb[] {
        return [...this.breadcrumbs];
    }

    /**
     * Clear breadcrumbs
     */
    public clearBreadcrumbs(): void {
        this.breadcrumbs = [];
    }

    /**
     * Setup automatic tracking
     */
    private setupAutoTracking(): void {
        // Track navigation
        this.trackNavigation();

        // Track clicks
        this.trackClicks();

        // Track inputs
        this.trackInputs();

        // Track network errors
        this.trackNetworkErrors();
    }

    /**
     * Track navigation
     */
    private trackNavigation(): void {
        // Track initial page load
        this.addBreadcrumb({
            type: 'navigation',
            category: 'navigation',
            message: `Page loaded: ${window.location.pathname}`,
            level: 'info'
        });

        // Track route changes (for SPAs)
        let lastPath = window.location.pathname;
        const checkPath = () => {
            const currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
                this.addBreadcrumb({
                    type: 'navigation',
                    category: 'navigation',
                    message: `Navigated to: ${currentPath}`,
                    data: { from: lastPath, to: currentPath },
                    level: 'info'
                });
                lastPath = currentPath;
            }
        };

        // Check for path changes every 100ms
        setInterval(checkPath, 100);

        // Also listen to popstate
        window.addEventListener('popstate', () => {
            checkPath();
        });
    }

    /**
     * Track clicks
     */
    private trackClicks(): void {
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const text = target.textContent?.substring(0, 50) || '';
            const id = target.id;
            const className = target.className;

            // Only track meaningful clicks (buttons, links, etc.)
            if (['button', 'a', 'input'].includes(tagName)) {
                this.addBreadcrumb({
                    type: 'click',
                    category: 'ui',
                    message: `Clicked ${tagName}: ${text}`,
                    data: {
                        tagName,
                        id,
                        className,
                        text
                    },
                    level: 'info'
                });
            }
        }, { capture: true });
    }

    /**
     * Track inputs
     */
    private trackInputs(): void {
        document.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            const tagName = target.tagName.toLowerCase();
            const type = target.type;
            const name = target.name;
            const id = target.id;

            // Don't track sensitive inputs
            if (['password', 'creditcard', 'ssn'].includes(type)) {
                return;
            }

            this.addBreadcrumb({
                type: 'input',
                category: 'ui',
                message: `Input changed: ${name || id || tagName}`,
                data: {
                    tagName,
                    type,
                    name,
                    id
                },
                level: 'info'
            });
        }, { capture: true });
    }

    /**
     * Track network errors
     */
    private trackNetworkErrors(): void {
        // Track fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = Date.now();
            try {
                const response = await originalFetch(...args);
                const duration = Date.now() - startTime;

                this.addBreadcrumb({
                    type: 'api',
                    category: 'network',
                    message: `API call: ${args[0]}`,
                    data: {
                        url: args[0],
                        status: response.status,
                        duration
                    },
                    level: response.ok ? 'info' : 'warning'
                });

                return response;
            } catch (error) {
                const duration = Date.now() - startTime;
                this.addBreadcrumb({
                    type: 'api',
                    category: 'network',
                    message: `API error: ${args[0]}`,
                    data: {
                        url: args[0],
                        error: (error as Error).message,
                        duration
                    },
                    level: 'error'
                });
                throw error;
            }
        };
    }

    /**
     * Detect browser
     */
    private detectBrowser(ua: string): string {
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Unknown';
    }

    /**
     * Detect browser version
     */
    private detectBrowserVersion(ua: string): string {
        const patterns = [
            /Edg\/(\d+)/,
            /Chrome\/(\d+)/,
            /Firefox\/(\d+)/,
            /Version\/(\d+).*Safari/,
            /OPR\/(\d+)/
        ];

        for (const pattern of patterns) {
            const match = ua.match(pattern);
            if (match) return match[1];
        }

        return 'Unknown';
    }

    /**
     * Detect OS
     */
    private detectOS(ua: string): string {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS X')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }

    /**
     * Detect OS version
     */
    private detectOSVersion(ua: string): string {
        // Windows
        if (ua.includes('Windows NT 10.0')) return '10';
        if (ua.includes('Windows NT 6.3')) return '8.1';
        if (ua.includes('Windows NT 6.2')) return '8';
        if (ua.includes('Windows NT 6.1')) return '7';

        // macOS
        const macMatch = ua.match(/Mac OS X (\d+[._]\d+)/);
        if (macMatch) return macMatch[1].replace('_', '.');

        // Android
        const androidMatch = ua.match(/Android (\d+\.\d+)/);
        if (androidMatch) return androidMatch[1];

        // iOS
        const iosMatch = ua.match(/OS (\d+_\d+)/);
        if (iosMatch) return iosMatch[1].replace('_', '.');

        return 'Unknown';
    }

    /**
     * Get localStorage safely
     */
    private getLocalStorageSafe(): Record<string, any> {
        try {
            const storage: Record<string, any> = {};
            const blockedKeys = ['password', 'token', 'secret', 'apiKey'];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !blockedKeys.some(blocked => key.toLowerCase().includes(blocked))) {
                    storage[key] = localStorage.getItem(key);
                }
            }
            return storage;
        } catch {
            return {};
        }
    }

    /**
     * Get sessionStorage safely
     */
    private getSessionStorageSafe(): Record<string, any> {
        try {
            const storage: Record<string, any> = {};
            const blockedKeys = ['password', 'token', 'secret', 'apiKey'];

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && !blockedKeys.some(blocked => key.toLowerCase().includes(blocked))) {
                    storage[key] = sessionStorage.getItem(key);
                }
            }
            return storage;
        } catch {
            return {};
        }
    }
}

/**
 * Export singleton instance
 */
export const contextCollector = ContextCollector.getInstance();

/**
 * Convenience functions
 */
export const collectBrowserInfo = () => contextCollector.collectBrowserInfo();
export const collectNetworkInfo = () => contextCollector.collectNetworkInfo();
export const collectPerformanceMetrics = () => contextCollector.collectPerformanceMetrics();
export const collectStateSnapshot = () => contextCollector.collectStateSnapshot();
export const addBreadcrumb = (breadcrumb: Omit<Breadcrumb, 'timestamp'>) => contextCollector.addBreadcrumb(breadcrumb);
export const getBreadcrumbs = () => contextCollector.getBreadcrumbs();

