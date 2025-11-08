/**
 * Comprehensive Bundle Monitor Tests
 * Tests bundle size monitoring, metrics recording, and optimization recommendations
 */

// Mock logging config before importing
jest.mock('../../config/logging.config');

import { BundleMonitor, checkBundleThresholds, BUNDLE_THRESHOLDS, exportBundleMetrics } from '../bundleMonitor';

describe('BundleMonitor', () => {
  let bundleMonitor: BundleMonitor;

  beforeEach(() => {
    // Get fresh singleton instance for each test
    // Reset the singleton by creating a new instance
    (BundleMonitor as any).instance = null;
    bundleMonitor = BundleMonitor.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BundleMonitor.getInstance();
      const instance2 = BundleMonitor.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should maintain state across calls', () => {
      const monitor1 = BundleMonitor.getInstance();

      // Record some metrics
      const testChunks = [
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: ['react', 'lodash']
        }
      ];

      monitor1.recordBuildMetrics(testChunks);

      // Get new instance reference
      const monitor2 = BundleMonitor.getInstance();

      expect(monitor2.getCurrentMetrics()).toBeTruthy();
      expect(monitor2.getHistory().length).toBe(1);
    });
  });

  describe('Metrics Recording', () => {
    it('should record build metrics correctly', () => {
      const testChunks = [
        {
          fileName: 'vendor.js',
          size: 150000,
          gzipSize: 75000,
          modules: ['react', 'react-dom']
        },
        {
          fileName: 'main.js',
          size: 50000,
          gzipSize: 25000,
          modules: ['App', 'Dashboard']
        },
        {
          fileName: 'styles.css',
          size: 10000,
          gzipSize: 5000,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(testChunks);

      const metrics = bundleMonitor.getCurrentMetrics();

      expect(metrics).toBeTruthy();
      expect(metrics!.totalSize).toBe(210000);
      expect(metrics!.gzippedSize).toBe(105000);
      expect(metrics!.chunks).toHaveLength(3);
      expect(metrics!.largestChunks).toHaveLength(2); // Top 2 largest
    });

    it('should determine chunk types correctly', () => {
      const testChunks = [
        {
          fileName: 'vendor~main.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        },
        {
          fileName: 'styles.css',
          size: 10000,
          gzipSize: 5000,
          modules: []
        },
        {
          fileName: 'assets/image.png',
          size: 5000,
          gzipSize: 3000,
          modules: []
        },
        {
          fileName: 'component-abc.js',
          size: 25000,
          gzipSize: 12500,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(testChunks);

      const metrics = bundleMonitor.getCurrentMetrics();
      const chunkTypes = metrics!.chunks.map(c => c.type);

      expect(chunkTypes).toContain('vendor');
      expect(chunkTypes).toContain('style');
      expect(chunkTypes).toContain('asset');
      expect(chunkTypes).toContain('component');
    });

    it('should maintain history within limits', () => {
      // Record more than maxHistorySize (10) metrics
      for (let i = 0; i < 15; i++) {
        bundleMonitor.recordBuildMetrics([
          {
            fileName: `chunk-${i}.js`,
            size: 10000 * (i + 1),
            gzipSize: 5000 * (i + 1),
            modules: []
          }
        ]);
      }

      const history = bundleMonitor.getHistory();
      expect(history.length).toBe(10); // Should be capped at maxHistorySize
    });

    it('should handle empty chunks array', () => {
      bundleMonitor.recordBuildMetrics([]);

      const metrics = bundleMonitor.getCurrentMetrics();

      expect(metrics).toBeTruthy();
      expect(metrics!.totalSize).toBe(0);
      expect(metrics!.gzippedSize).toBe(0);
      expect(metrics!.chunks).toHaveLength(0);
      expect(metrics!.largestChunks).toHaveLength(0);
    });
  });

  describe('Metrics Retrieval', () => {
    beforeEach(() => {
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        }
      ]);
    });

    it('should return current metrics', () => {
      const metrics = bundleMonitor.getCurrentMetrics();

      expect(metrics).toBeTruthy();
      expect(metrics!.timestamp).toBeTruthy();
      expect(metrics!.totalSize).toBe(100000);
    });

    it('should return null when no metrics recorded', () => {
      const freshMonitor = BundleMonitor.getInstance();
      (BundleMonitor as any).instance = null; // Reset singleton

      const metrics = freshMonitor.getCurrentMetrics();
      expect(metrics).toBeNull();
    });

    it('should return complete history', () => {
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'chunk2.js',
          size: 20000,
          gzipSize: 10000,
          modules: []
        }
      ]);

      const history = bundleMonitor.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].totalSize).toBe(100000);
      expect(history[1].totalSize).toBe(20000);
    });
  });

  describe('Comparison with Previous', () => {
    it('should calculate difference with previous build', () => {
      // First build
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        }
      ]);

      // Second build - larger
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'vendor.js',
          size: 150000,
          gzipSize: 75000,
          modules: []
        }
      ]);

      const comparison = bundleMonitor.compareWithPrevious();

      expect(comparison).toBeTruthy();
      expect(comparison!.difference).toBe(50000);
      expect(comparison!.percentage).toBe(50);
    });

    it('should return null when no previous build exists', () => {
      const comparison = bundleMonitor.compareWithPrevious();
      expect(comparison).toBeNull();
    });

    it('should handle size reduction', () => {
      // First build - large
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'vendor.js',
          size: 150000,
          gzipSize: 75000,
          modules: []
        }
      ]);

      // Second build - smaller
      bundleMonitor.recordBuildMetrics([
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        }
      ]);

      const comparison = bundleMonitor.compareWithPrevious();

      expect(comparison!.difference).toBe(-50000);
      expect(comparison!.percentage).toBe(-33.333333333333336);
    });
  });

  describe('Recommendations Generation', () => {
    it('should recommend splitting large vendor chunks', () => {
      const largeVendorChunks = [
        {
          fileName: 'vendor.js',
          size: 600 * 1024, // 600 kB - exceeds threshold
          gzipSize: 300 * 1024,
          type: 'vendor' as const,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(largeVendorChunks);

      const metrics = bundleMonitor.getCurrentMetrics();
      expect(metrics!.recommendations).toContain(
        'Consider splitting large vendor chunks: vendor.js'
      );
    });

    it('should recommend lazy loading for large components', () => {
      const largeComponentChunks = [
        {
          fileName: 'HeavyComponent.js',
          size: 100 * 1024, // 100 kB - exceeds threshold
          gzipSize: 50 * 1024,
          type: 'component' as const,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(largeComponentChunks);

      const metrics = bundleMonitor.getCurrentMetrics();
      expect(metrics!.recommendations).toContain(
        'Consider lazy loading large components: HeavyComponent.js'
      );
    });

    it('should detect potential duplicate dependencies', () => {
      const chunksWithDuplicates = [
        {
          fileName: 'vendor1.js',
          size: 100000,
          gzipSize: 50000,
          type: 'vendor' as const,
          modules: ['react', 'lodash', 'axios']
        },
        {
          fileName: 'vendor2.js',
          size: 80000,
          gzipSize: 40000,
          type: 'vendor' as const,
          modules: ['react', 'lodash', 'moment'] // react and lodash duplicated
        }
      ];

      bundleMonitor.recordBuildMetrics(chunksWithDuplicates);

      const metrics = bundleMonitor.getCurrentMetrics();
      expect(metrics!.recommendations.some(r =>
        r.includes('duplicate dependencies')
      )).toBe(true);
    });

    it('should recommend tree-shaking for unused exports', () => {
      const chunksWithUnusedExports = [
        {
          fileName: 'component.js',
          size: 50000,
          gzipSize: 25000,
          type: 'component' as const,
          modules: ['Component (ignored)', 'utils (ignored)']
        }
      ];

      bundleMonitor.recordBuildMetrics(chunksWithUnusedExports);

      const metrics = bundleMonitor.getCurrentMetrics();
      expect(metrics!.recommendations).toContain(
        'Enable tree-shaking for better bundle size'
      );
    });

    it('should generate multiple recommendations', () => {
      const problematicChunks = [
        {
          fileName: 'huge-vendor.js',
          size: 800 * 1024, // Large vendor chunk
          gzipSize: 400 * 1024,
          type: 'vendor' as const,
          modules: ['lodash', 'lodash'] // Duplicate
        },
        {
          fileName: 'huge-component.js',
          size: 100 * 1024, // Large component chunk
          gzipSize: 50 * 1024,
          type: 'component' as const,
          modules: ['Component (ignored)']
        }
      ];

      bundleMonitor.recordBuildMetrics(problematicChunks);

      const metrics = bundleMonitor.getCurrentMetrics();
      expect(metrics!.recommendations.length).toBeGreaterThan(1);
    });
  });

  describe('Console Logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'group').mockImplementation();
      jest.spyOn(console, 'groupEnd').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log bundle analysis in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const testChunks = [
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(testChunks);

      expect(console.group).toHaveBeenCalledWith('📦 Bundle Analysis');
      expect(console.log).toHaveBeenCalledWith(
        'Total Size: 97.66 kB'
      );
      expect(console.log).toHaveBeenCalledWith(
        'Gzipped: 48.83 kB'
      );

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log in production mode', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const testChunks = [
        {
          fileName: 'vendor.js',
          size: 100000,
          gzipSize: 50000,
          modules: []
        }
      ];

      bundleMonitor.recordBuildMetrics(testChunks);

      expect(console.group).not.toHaveBeenCalled();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('checkBundleThresholds', () => {
  it('should not generate warnings for small bundles', () => {
    const smallBundleMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 100 * 1024, // 100 kB
      gzippedSize: 50 * 1024,  // 50 kB
      chunks: [
        {
          name: 'main.js',
          size: 50 * 1024,
          gzippedSize: 25 * 1024,
          type: 'component' as const
        }
      ],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(smallBundleMetrics);

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should warn about large main chunk', () => {
    const largeMainChunkMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 500 * 1024, // 500 kB
      gzippedSize: 250 * 1024,
      chunks: [
        {
          name: 'index-abc123.js',
          size: 300 * 1024, // 300 kB - exceeds MAIN_CHUNK threshold
          gzippedSize: 150 * 1024,
          type: 'component' as const
        }
      ],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(largeMainChunkMetrics);

    expect(result.warnings).toContain(
      'Main bundle size (292.97 kB) exceeds recommended threshold (195.31 kB)'
    );
  });

  it('should warn about large vendor chunks', () => {
    const largeVendorMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 600 * 1024,
      gzippedSize: 300 * 1024,
      chunks: [
        {
          name: 'vendor.js',
          size: 550 * 1024, // 550 kB vendor chunk
          gzippedSize: 275 * 1024,
          type: 'vendor' as const
        }
      ],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(largeVendorMetrics);

    expect(result.warnings).toContain(
      'Total vendor size (537.11 kB) exceeds recommended threshold (488.28 kB)'
    );
  });

  it('should error on excessive total bundle size', () => {
    const excessiveBundleMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 3 * 1024 * 1024, // 3 MB - exceeds TOTAL_SIZE threshold
      gzippedSize: 1.5 * 1024 * 1024,
      chunks: [],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(excessiveBundleMetrics);

    expect(result.errors).toContain(
      'Total bundle size (3.00 MB) exceeds maximum threshold (2.00 MB)'
    );
  });

  it('should warn about large gzipped size', () => {
    const largeGzipMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 600 * 1024,
      gzippedSize: 600 * 1024, // 600 kB gzipped - exceeds threshold
      chunks: [],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(largeGzipMetrics);

    expect(result.warnings).toContain(
      'Gzipped bundle size (585.94 kB) exceeds recommended threshold (488.28 kB)'
    );
  });

  it('should generate multiple warnings and errors', () => {
    const problematicMetrics = {
      timestamp: new Date().toISOString(),
      totalSize: 3 * 1024 * 1024, // Exceeds total size
      gzippedSize: 600 * 1024,     // Exceeds gzip threshold
      chunks: [
        {
          name: 'index-abc.js',
          size: 300 * 1024, // Exceeds main chunk threshold
          gzippedSize: 150 * 1024,
          type: 'component' as const
        },
        {
          name: 'vendor.js',
          size: 600 * 1024, // Large vendor chunk
          gzippedSize: 300 * 1024,
          type: 'vendor' as const
        }
      ],
      largestChunks: [],
      recommendations: []
    };

    const result = checkBundleThresholds(problematicMetrics);

    expect(result.warnings.length).toBeGreaterThan(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('exportBundleMetrics', () => {
  let createElementSpy: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock DOM methods
    createElementSpy = jest.spyOn(document, 'createElement');
    clickSpy = jest.fn();
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
    revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();

    // Mock link element
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy
    };
    createElementSpy.mockReturnValue(mockLink as any);

    // Mock URL.createObjectURL
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    // Mock Blob
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      content,
      options
    })) as any;
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should export bundle metrics to JSON file', () => {
    // Record some metrics first
    const monitor = BundleMonitor.getInstance();
    monitor.recordBuildMetrics([
      {
        fileName: 'test.js',
        size: 10000,
        gzipSize: 5000,
        modules: []
      }
    ]);

    exportBundleMetrics();

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should use custom filename when provided', () => {
    const monitor = BundleMonitor.getInstance();
    monitor.recordBuildMetrics([
      {
        fileName: 'test.js',
        size: 10000,
        gzipSize: 5000,
        modules: []
      }
    ]);

    const customFilename = 'custom-metrics.json';
    exportBundleMetrics(customFilename);

    const mockLink = createElementSpy.mock.results[0].value;
    expect(mockLink.download).toBe(customFilename);
  });

  it('should generate default filename when not provided', () => {
    const monitor = BundleMonitor.getInstance();
    monitor.recordBuildMetrics([
      {
        fileName: 'test.js',
        size: 10000,
        gzipSize: 5000,
        modules: []
      }
    ]);

    exportBundleMetrics();

    const mockLink = createElementSpy.mock.results[0].value;
    expect(mockLink.download).toMatch(/bundle-metrics-\d{4}-\d{2}-\d{2}\.json/);
  });

  it('should handle empty metrics gracefully', () => {
    // Reset singleton to have no metrics
    (BundleMonitor as any).instance = null;
    const freshMonitor = BundleMonitor.getInstance();

    expect(() => exportBundleMetrics()).not.toThrow();
  });
});
