export class MonitoringManager {
    static instance;
    logs = [];
    metrics = new Map();
    alerts = new Map();
    logListeners = [];
    metricListeners = [];
    alertListeners = [];
    maxLogEntries = 10000;
    maxMetricsPerName = 1000;
    constructor() { }
    static getInstance() {
        if (!MonitoringManager.instance) {
            MonitoringManager.instance = new MonitoringManager();
        }
        return MonitoringManager.instance;
    }
    // ===== LOGGING METHODS =====
    /**
     * Log a message
     */
    log(level, message, category = 'general', metadata, userId, sessionId, requestId) {
        const logEntry = {
            id: this.generateId(),
            timestamp: new Date(),
            level,
            message,
            category,
            metadata,
            userId,
            sessionId,
            requestId
        };
        this.addLogEntry(logEntry);
    }
    /**
     * Log debug message
     */
    debug(message, category, metadata) {
        this.log('debug', message, category, metadata);
    }
    /**
     * Log info message
     */
    info(message, category, metadata) {
        this.log('info', message, category, metadata);
    }
    /**
     * Log warning message
     */
    warn(message, category, metadata) {
        this.log('warn', message, category, metadata);
    }
    /**
     * Log error message
     */
    error(message, error, category, metadata) {
        const errorMetadata = error ? {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            ...metadata
        } : metadata;
        this.log('error', message, category, errorMetadata);
    }
    /**
     * Log fatal error message
     */
    fatal(message, error, category, metadata) {
        const errorMetadata = error ? {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            ...metadata
        } : metadata;
        this.log('fatal', message, category, errorMetadata);
    }
    /**
     * Log API request
     */
    logAPIRequest(method, path, statusCode, duration, userId, requestId, metadata) {
        this.log('info', `${method} ${path} - ${statusCode}`, 'api', {
            method,
            path,
            statusCode,
            duration,
            ...metadata
        }, userId, undefined, requestId);
    }
    /**
     * Log security event
     */
    logSecurityEvent(event, severity, details, userId, ipAddress) {
        this.log('warn', `Security event: ${event}`, 'security', {
            event,
            severity,
            details,
            ipAddress
        }, userId);
        // Trigger alert for high/critical security events
        if (severity === 'high' || severity === 'critical') {
            this.triggerAlert(`security_${event}`, `Security event: ${event}`, severity);
        }
    }
    /**
     * Get logs with filtering
     */
    getLogs(filters) {
        let filteredLogs = [...this.logs];
        if (filters) {
            if (filters.level) {
                filteredLogs = filteredLogs.filter(log => log.level === filters.level);
            }
            if (filters.category) {
                filteredLogs = filteredLogs.filter(log => log.category === filters.category);
            }
            if (filters.userId) {
                filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
            }
            if (filters.startTime) {
                filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime);
            }
            if (filters.endTime) {
                filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime);
            }
            if (filters.limit) {
                filteredLogs = filteredLogs.slice(-filters.limit);
            }
        }
        return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }
    // ===== METRICS METHODS =====
    /**
     * Record a metric
     */
    recordMetric(name, value, type = 'gauge', tags) {
        const metric = {
            name,
            value,
            type,
            tags,
            timestamp: new Date()
        };
        this.addMetric(metric);
        this.notifyMetricListeners(metric);
    }
    /**
     * Increment a counter
     */
    incrementCounter(name, value = 1, tags) {
        this.recordMetric(name, value, 'counter', tags);
    }
    /**
     * Record a gauge value
     */
    recordGauge(name, value, tags) {
        this.recordMetric(name, value, 'gauge', tags);
    }
    /**
     * Record a histogram value
     */
    recordHistogram(name, value, tags) {
        this.recordMetric(name, value, 'histogram', tags);
    }
    /**
     * Record a timer value
     */
    recordTimer(name, duration, tags) {
        this.recordMetric(name, duration, 'timer', tags);
    }
    /**
     * Start a timer
     */
    startTimer(name, tags) {
        const startTime = Date.now();
        return () => {
            const duration = Date.now() - startTime;
            this.recordTimer(name, duration, tags);
        };
    }
    /**
     * Get metrics
     */
    getMetrics(name, startTime, endTime) {
        let allMetrics = [];
        if (name) {
            allMetrics = this.metrics.get(name) || [];
        }
        else {
            for (const metrics of this.metrics.values()) {
                allMetrics.push(...metrics);
            }
        }
        if (startTime || endTime) {
            allMetrics = allMetrics.filter(metric => {
                if (startTime && metric.timestamp < startTime)
                    return false;
                if (endTime && metric.timestamp > endTime)
                    return false;
                return true;
            });
        }
        return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Get metric statistics
     */
    getMetricStats(name, startTime, endTime) {
        const metrics = this.getMetrics(name, startTime, endTime);
        if (metrics.length === 0) {
            return null;
        }
        const values = metrics.map(m => m.value);
        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            sum: values.reduce((sum, val) => sum + val, 0)
        };
    }
    // ===== ALERTS METHODS =====
    /**
     * Create an alert
     */
    createAlert(name, condition, threshold, severity = 'medium', channels = ['console']) {
        const alert = {
            id: this.generateId(),
            name,
            condition,
            threshold,
            severity,
            enabled: true,
            channels,
            createdAt: new Date()
        };
        this.alerts.set(name, alert);
    }
    /**
     * Trigger an alert
     */
    triggerAlert(name, message, severity = 'medium', metadata) {
        const alert = this.alerts.get(name);
        if (!alert || !alert.enabled) {
            return;
        }
        // Update last triggered time
        alert.lastTriggered = new Date();
        // Log the alert
        this.log('warn', `Alert triggered: ${message}`, 'alert', {
            alertName: name,
            severity,
            ...metadata
        });
        // Notify alert listeners
        this.notifyAlertListeners({
            ...alert,
            message,
            metadata
        });
        // Send to configured channels
        this.sendAlertToChannels(alert, message, metadata);
    }
    /**
     * Get alerts
     */
    getAlerts() {
        return Array.from(this.alerts.values());
    }
    /**
     * Enable/disable alert
     */
    setAlertEnabled(name, enabled) {
        const alert = this.alerts.get(name);
        if (alert) {
            alert.enabled = enabled;
        }
    }
    /**
     * Delete alert
     */
    deleteAlert(name) {
        this.alerts.delete(name);
    }
    // ===== EVENT LISTENERS =====
    /**
     * Add log listener
     */
    onLog(callback) {
        this.logListeners.push(callback);
        return () => {
            const index = this.logListeners.indexOf(callback);
            if (index > -1) {
                this.logListeners.splice(index, 1);
            }
        };
    }
    /**
     * Add metric listener
     */
    onMetric(callback) {
        this.metricListeners.push(callback);
        return () => {
            const index = this.metricListeners.indexOf(callback);
            if (index > -1) {
                this.metricListeners.splice(index, 1);
            }
        };
    }
    /**
     * Add alert listener
     */
    onAlert(callback) {
        this.alertListeners.push(callback);
        return () => {
            const index = this.alertListeners.indexOf(callback);
            if (index > -1) {
                this.alertListeners.splice(index, 1);
            }
        };
    }
    // ===== PRIVATE HELPER METHODS =====
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    addLogEntry(logEntry) {
        this.logs.push(logEntry);
        // Trim logs if exceeding max entries
        if (this.logs.length > this.maxLogEntries) {
            this.logs = this.logs.slice(-this.maxLogEntries);
        }
        this.notifyLogListeners(logEntry);
    }
    addMetric(metric) {
        if (!this.metrics.has(metric.name)) {
            this.metrics.set(metric.name, []);
        }
        const metrics = this.metrics.get(metric.name);
        metrics.push(metric);
        // Trim metrics if exceeding max entries per name
        if (metrics.length > this.maxMetricsPerName) {
            metrics.splice(0, metrics.length - this.maxMetricsPerName);
        }
    }
    notifyLogListeners(log) {
        this.logListeners.forEach(listener => {
            try {
                listener(log);
            }
            catch (error) {
                console.error('Error in log listener:', error);
            }
        });
    }
    notifyMetricListeners(metric) {
        this.metricListeners.forEach(listener => {
            try {
                listener(metric);
            }
            catch (error) {
                console.error('Error in metric listener:', error);
            }
        });
    }
    notifyAlertListeners(alert) {
        this.alertListeners.forEach(listener => {
            try {
                listener(alert);
            }
            catch (error) {
                console.error('Error in alert listener:', error);
            }
        });
    }
    sendAlertToChannels(alert, message, metadata) {
        alert.channels.forEach(channel => {
            switch (channel) {
                case 'console':
                    console.warn(`[ALERT] ${alert.name}: ${message}`, metadata);
                    break;
                case 'email':
                    // In a real implementation, send email
                    break;
                case 'slack':
                    // In a real implementation, send to Slack
                    break;
                case 'webhook':
                    // In a real implementation, send to webhook
                    break;
            }
        });
    }
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Get monitoring statistics
     */
    getStats() {
        const logsByLevel = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0,
            fatal: 0
        };
        this.logs.forEach(log => {
            logsByLevel[log.level]++;
        });
        const alerts = Array.from(this.alerts.values());
        return {
            totalLogs: this.logs.length,
            totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
            totalAlerts: alerts.length,
            enabledAlerts: alerts.filter(a => a.enabled).length,
            logsByLevel
        };
    }
    /**
     * Export logs to JSON
     */
    exportLogs(filters) {
        const logs = this.getLogs(filters);
        return JSON.stringify(logs, null, 2);
    }
    /**
     * Export metrics to JSON
     */
    exportMetrics(name, startTime, endTime) {
        const metrics = this.getMetrics(name, startTime, endTime);
        return JSON.stringify(metrics, null, 2);
    }
    /**
     * Health check
     */
    healthCheck() {
        const checks = {
            logsWritable: true,
            metricsWritable: true,
            alertsEnabled: this.alerts.size > 0
        };
        const failedChecks = Object.values(checks).filter(check => !check).length;
        let status = 'healthy';
        if (failedChecks > 0) {
            status = failedChecks === Object.keys(checks).length ? 'unhealthy' : 'degraded';
        }
        return {
            status,
            checks,
            timestamp: new Date()
        };
    }
}
