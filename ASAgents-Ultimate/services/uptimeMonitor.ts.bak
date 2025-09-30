export interface UptimeRecord {
  timestamp: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

export interface UptimeStats {
  uptime: number; // Percentage
  totalChecks: number;
  uptimeRecords: UptimeRecord[];
  averageResponseTime: number;
  currentStatus: 'up' | 'down' | 'degraded';
  lastCheck: string;
  downtimeEvents: Array<{
    start: string;
    end?: string;
    duration?: number;
    reason?: string;
  }>;
}

export class UptimeMonitor {
  private static instance: UptimeMonitor;
  private readonly records: UptimeRecord[] = [];
  private readonly maxRecords = 2000; // Keep 2000 records (about 2 days if checking every minute)
  private readonly checkInterval: number;
  private intervalId: number | null = null;
  private readonly startTime = Date.now();
  private lastStatus: 'up' | 'down' | 'degraded' = 'up';

  constructor(checkInterval = 60000) { // Default: check every minute
    this.checkInterval = checkInterval;
  }

  static getInstance(checkInterval = 60000): UptimeMonitor {
    if (!UptimeMonitor.instance) {
      UptimeMonitor.instance = new UptimeMonitor(checkInterval);
    }
    return UptimeMonitor.instance;
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    // Initial check
    this.performCheck();

    // Set up recurring checks
    this.intervalId = window.setInterval(() => {
      this.performCheck();
    }, this.checkInterval);

    console.log(`Uptime monitoring started (checking every ${this.checkInterval / 1000}s)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Uptime monitoring stopped');
    }
  }

  private async performCheck(): Promise<void> {
    const timestamp = new Date().toISOString();
    const checkStart = performance.now();

    try {
      // Perform health check using the health monitor
      const { healthMonitor } = await import('./healthMonitor');
      const healthResult = await healthMonitor.performHealthCheck();
      
      const responseTime = performance.now() - checkStart;
      let status: 'up' | 'down' | 'degraded';

      switch (healthResult.status) {
        case 'healthy':
          status = 'up';
          break;
        case 'degraded':
          status = 'degraded';
          break;
        case 'unhealthy':
          status = 'down';
          break;
        default:
          status = 'down';
      }

      const record: UptimeRecord = {
        timestamp,
        status,
        responseTime
      };

      this.addRecord(record);
      this.lastStatus = status;

    } catch (error) {
      const responseTime = performance.now() - checkStart;
      const record: UptimeRecord = {
        timestamp,
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.addRecord(record);
      this.lastStatus = 'down';
    }

    this.persistRecords();
  }

  private addRecord(record: UptimeRecord): void {
    this.records.unshift(record);

    // Maintain max records limit
    if (this.records.length > this.maxRecords) {
      this.records.splice(this.maxRecords);
    }
  }

  getStats(): UptimeStats {
    if (this.records.length === 0) {
      return {
        uptime: 100,
        totalChecks: 0,
        uptimeRecords: [],
        averageResponseTime: 0,
        currentStatus: 'up',
        lastCheck: new Date().toISOString(),
        downtimeEvents: []
      };
    }

    const totalChecks = this.records.length;
    const upCount = this.records.filter(r => r.status === 'up').length;
    const uptime = (upCount / totalChecks) * 100;

    const responseTimes = this.records
      .filter(r => r.responseTime !== undefined)
      .map(r => r.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate downtime events
    const downtimeEvents = this.calculateDowntimeEvents();

    return {
      uptime: Math.round(uptime * 100) / 100,
      totalChecks,
      uptimeRecords: this.records.slice(0, 100), // Return last 100 for display
      averageResponseTime,
      currentStatus: this.lastStatus,
      lastCheck: this.records[0]?.timestamp || new Date().toISOString(),
      downtimeEvents
    };
  }

  private calculateDowntimeEvents(): Array<{
    start: string;
    end?: string;
    duration?: number;
    reason?: string;
  }> {
    const events: Array<{
      start: string;
      end?: string;
      duration?: number;
      reason?: string;
    }> = [];

    let currentDowntime: {
      start: string;
      end?: string;
      duration?: number;
      reason?: string;
    } | null = null;

    // Go through records in chronological order (reverse)
    for (let i = this.records.length - 1; i >= 0; i--) {
      const record = this.records[i];

      if (record.status === 'down' && !currentDowntime) {
        // Start of downtime
        currentDowntime = {
          start: record.timestamp,
          reason: record.error
        };
      } else if (record.status === 'up' && currentDowntime) {
        // End of downtime
        currentDowntime.end = record.timestamp;
        currentDowntime.duration = new Date(record.timestamp).getTime() - 
                                   new Date(currentDowntime.start).getTime();
        events.push(currentDowntime);
        currentDowntime = null;
      }
    }

    // If we're currently in downtime, add it without an end time
    if (currentDowntime) {
      events.push(currentDowntime);
    }

    return events.reverse(); // Return most recent first
  }

  getUptimeForPeriod(hours: number): number {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const relevantRecords = this.records.filter(
      record => new Date(record.timestamp).getTime() > cutoff
    );

    if (relevantRecords.length === 0) return 100;

    const upCount = relevantRecords.filter(r => r.status === 'up').length;
    return Math.round((upCount / relevantRecords.length) * 10000) / 100;
  }

  getCurrentStatus(): 'up' | 'down' | 'degraded' {
    return this.lastStatus;
  }

  getRecentRecords(limit = 50): UptimeRecord[] {
    return this.records.slice(0, limit);
  }

  exportData(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      allRecords: this.records,
      configuration: {
        checkInterval: this.checkInterval,
        maxRecords: this.maxRecords,
        startTime: this.startTime
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  private persistRecords(): void {
    try {
      // Save last 500 records to localStorage
      const recordsToSave = this.records.slice(0, 500);
      const dataToSave = {
        records: recordsToSave,
        lastStatus: this.lastStatus,
        timestamp: Date.now()
      };
      localStorage.setItem('asagents_uptime_monitoring', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to persist uptime data:', error);
    }
  }

  loadPersistedData(): void {
    try {
      const saved = localStorage.getItem('asagents_uptime_monitoring');
      if (saved) {
        const parsedData = JSON.parse(saved);
        
        // Only load data from last 24 hours
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        const validRecords = parsedData.records?.filter((record: UptimeRecord) => 
          new Date(record.timestamp).getTime() > cutoff
        ) || [];

        this.records.splice(0, 0, ...validRecords);
        this.lastStatus = parsedData.lastStatus || 'up';
        
        console.log(`Loaded ${validRecords.length} uptime records from storage`);
      }
    } catch (error) {
      console.warn('Failed to load persisted uptime data:', error);
    }
  }

  // Utility methods for display
  formatUptime(percentage: number): string {
    if (percentage >= 99.99) return '99.99%+';
    if (percentage >= 99.9) return `${percentage.toFixed(2)}%`;
    return `${percentage.toFixed(1)}%`;
  }

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getSLA(targetUptime = 99.9): {
    current: number;
    target: number;
    status: 'meeting' | 'at_risk' | 'breached';
    timeToRecover?: number;
  } {
    const current = this.getUptimeForPeriod(24 * 30); // 30 days
    
    let status: 'meeting' | 'at_risk' | 'breached';
    if (current >= targetUptime) {
      status = 'meeting';
    } else if (current >= targetUptime - 0.5) {
      status = 'at_risk';
    } else {
      status = 'breached';
    }

    return {
      current,
      target: targetUptime,
      status
    };
  }
}

export const uptimeMonitor = UptimeMonitor.getInstance();