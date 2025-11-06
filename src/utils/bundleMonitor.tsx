/**
 * Bundle Size Monitoring and Reporting
 * Task 1.3: Bundle Size Optimization
 */


export interface BundleMetrics {
  timestamp: string;
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  largestChunks: ChunkInfo[];
  recommendations: string[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'vendor' | 'component' | 'style' | 'asset';
  modules?: string[];
}

/**
 * Bundle size monitor class
 */
export class BundleMonitor {
  private static instance: BundleMonitor;
  private metrics: BundleMetrics[] = [];
  private readonly maxHistorySize = 10;

  static getInstance(): BundleMonitor {
    if (!BundleMonitor.instance) {
      BundleMonitor.instance = new BundleMonitor();
    }
    return BundleMonitor.instance;
  }

  /**
   * Record bundle metrics after build
   */
  recordBuildMetrics(chunks: any[]): void {
    const chunkInfo: ChunkInfo[] = chunks.map(chunk => ({
      name: chunk.fileName,
      size: chunk.size,
      gzippedSize: chunk.gzipSize || 0,
      type: this.determineChunkType(chunk.fileName),
      modules: chunk.modules || []
    }));

    const totalSize = chunkInfo.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunkInfo.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

    const metrics: BundleMetrics = {
      timestamp: new Date().toISOString(),
      totalSize,
      gzippedSize,
      chunks: chunkInfo,
      largestChunks: chunkInfo
        .sort((a, b) => b.size - a.size)
        .slice(0, 5),
      recommendations: this.generateRecommendations(chunkInfo)
    };

    this.metrics.push(metrics);

    // Keep only recent history
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics = this.metrics.slice(-this.maxHistorySize);
    }

    // Log to console in development
    if (isDev()) {
      console.group('📦 Bundle Analysis');
      console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} kB`);
      console.log(`Gzipped: ${(gzippedSize / 1024).toFixed(2)} kB`);
      console.log('Largest chunks:', metrics.largestChunks.map(c => `${c.name}: ${(c.size / 1024).toFixed(2)} kB`));
      if (metrics.recommendations.length > 0) {
        console.log('Recommendations:', metrics.recommendations);
      }
      console.groupEnd();
    }
  }

  /**
   * Get current bundle metrics
   */
  getCurrentMetrics(): BundleMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Get bundle size history
   */
  getHistory(): BundleMetrics[] {
    return [...this.metrics];
  }

  /**
   * Compare current metrics with previous build
   */
  compareWithPrevious(): { difference: number; percentage: number } | null {
    if (this.metrics.length < 2) return null;

    const current = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];

    const difference = current.totalSize - previous.totalSize;
    const percentage = (difference / previous.totalSize) * 100;

    return { difference, percentage };
  }

  /**
   * Determine chunk type based on filename
   */
  private determineChunkType(filename: string): ChunkInfo['type'] {
    if (filename.includes('vendor') || filename.includes('node_modules')) {
      return 'vendor';
    }
    if (filename.endsWith('.css')) {
      return 'style';
    }
    if (filename.includes('assets/') && !filename.endsWith('.js')) {
      return 'asset';
    }
    return 'component';
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(chunks: ChunkInfo[]): string[] {
    const recommendations: string[] = [];

    // Check for large vendor chunks
    const largeVendorChunks = chunks.filter(c => c.type === 'vendor' && c.size > 100 * 1024);
    if (largeVendorChunks.length > 0) {
      recommendations.push(`Consider splitting large vendor chunks: ${largeVendorChunks.map(c => c.name).join(', ')}`);
    }

    // Check for large component chunks
    const largeComponentChunks = chunks.filter(c => c.type === 'component' && c.size > 50 * 1024);
    if (largeComponentChunks.length > 0) {
      recommendations.push(`Consider lazy loading large components: ${largeComponentChunks.map(c => c.name).join(', ')}`);
    }

    // Check for duplicate dependencies
    const vendorModules = chunks
      .filter(c => c.type === 'vendor')
      .flatMap(c => c.modules || []);

    const duplicates = vendorModules.filter((module, index) =>
      vendorModules.indexOf(module) !== index
    );

    if (duplicates.length > 0) {
      recommendations.push(`Found potential duplicate dependencies: ${[...new Set(duplicates)].slice(0, 3).join(', ')}`);
    }

    // Check for tree-shaking opportunities
    const unusedExports = chunks.filter(c =>
      c.modules && c.modules.some(m => m.includes(' (ignored)'))
    );

    if (unusedExports.length > 0) {
      recommendations.push('Enable tree-shaking for better bundle size');
    }

    return recommendations;
  }
}

/**
 * Bundle size thresholds for warnings
 */
export const BUNDLE_THRESHOLDS = {
  MAIN_CHUNK: 200 * 1024,    // 200 kB
  VENDOR_CHUNK: 500 * 1024,  // 500 kB
  TOTAL_SIZE: 2 * 1024 * 1024, // 2 MB
  GZIP_SIZE: 500 * 1024      // 500 kB gzipped
};

/**
 * Check if bundle size exceeds thresholds
 */
export const checkBundleThresholds = (metrics: BundleMetrics): { warnings: string[], errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check main chunk size
  const mainChunk = metrics.chunks.find(c => c.name.includes('index-') && c.name.endsWith('.js'));
  if (mainChunk && mainChunk.size > BUNDLE_THRESHOLDS.MAIN_CHUNK) {
    warnings.push(`Main bundle size (${(mainChunk.size / 1024).toFixed(2)} kB) exceeds recommended threshold (${BUNDLE_THRESHOLDS.MAIN_CHUNK / 1024} kB)`);
  }

  // Check vendor chunk size
  const vendorChunks = metrics.chunks.filter(c => c.type === 'vendor');
  const totalVendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  if (totalVendorSize > BUNDLE_THRESHOLDS.VENDOR_CHUNK) {
    warnings.push(`Total vendor size (${(totalVendorSize / 1024).toFixed(2)} kB) exceeds recommended threshold (${BUNDLE_THRESHOLDS.VENDOR_CHUNK / 1024} kB)`);
  }

  // Check total bundle size
  if (metrics.totalSize > BUNDLE_THRESHOLDS.TOTAL_SIZE) {
    errors.push(`Total bundle size (${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB) exceeds maximum threshold (${BUNDLE_THRESHOLDS.TOTAL_SIZE / 1024 / 1024} MB)`);
  }

  // Check gzipped size
  if (metrics.gzippedSize > BUNDLE_THRESHOLDS.GZIP_SIZE) {
    warnings.push(`Gzipped bundle size (${(metrics.gzippedSize / 1024).toFixed(2)} kB) exceeds recommended threshold (${BUNDLE_THRESHOLDS.GZIP_SIZE / 1024} kB)`);
  }

  return { warnings, errors };
};

/**
 * Export bundle metrics to JSON file
 */
export const exportBundleMetrics = (filename?: string): void => {
  const monitor = BundleMonitor.getInstance();
  const metrics = monitor.getHistory();
  const dataStr = JSON.stringify(metrics, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `bundle-metrics-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Global bundle monitor instance
export const bundleMonitor = BundleMonitor.getInstance();
