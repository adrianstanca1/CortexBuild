/**
 * Comprehensive Dynamic Imports Tests
 * Tests lazy loading, caching, and error handling for heavy dependencies
 */

import * as dynamicImports from '../dynamicImports';

// Mock the heavy dependencies
jest.mock('@monaco-editor/react', () => ({
  default: 'MonacoEditorComponent'
}), { virtual: true });

jest.mock('jspdf', () => ({
  default: 'jsPDF'
}), { virtual: true });

jest.mock('jspdf-autotable', () => ({
  default: 'jsPDFAutoTable'
}), { virtual: true });

jest.mock('@xyflow/react', () => ({
  default: 'ReactFlowComponent'
}), { virtual: true });

jest.mock('@google/generative-ai', () => ({
  default: 'GoogleGenerativeAI'
}), { virtual: true });

jest.mock('@google/genai', () => ({
  default: 'GoogleGenAI'
}), { virtual: true });

jest.mock('openai', () => ({
  default: 'OpenAI'
}), { virtual: true });

jest.mock('@supabase/supabase-js', () => ({
  default: 'SupabaseClient'
}), { virtual: true });

jest.mock('axios', () => ({
  default: 'AxiosClient'
}), { virtual: true });

jest.mock('uuid', () => ({
  default: 'UUID'
}), { virtual: true });

describe('Dynamic Imports', () => {
  beforeEach(() => {
    // Clear all cached modules before each test
    jest.clearAllMocks();

    // Reset module caches by redefining the promise variables
    // This simulates clearing the cache between tests
    Object.keys(dynamicImports).forEach(key => {
      if (dynamicImports[key as keyof typeof dynamicImports] &&
          typeof dynamicImports[key as keyof typeof dynamicImports] === 'object' &&
          'isLoaded' in dynamicImports[key as keyof typeof dynamicImports]) {
        // Reset the cached promise and module for each dynamic import
        (dynamicImports as any)[`${key.toLowerCase()}Promise`] = null;
        (dynamicImports as any)[`${key.toLowerCase()}Module`] = null;
      }
    });
  });

  describe('Individual Library Loading', () => {
    describe('Monaco Editor', () => {
      it('should load Monaco Editor on first call', async () => {
        const result = await dynamicImports.loadMonacoEditor();

        expect(result).toEqual({ default: 'MonacoEditorComponent' });
      });

      it('should cache Monaco Editor after first load', async () => {
        // First load
        await dynamicImports.loadMonacoEditor();

        // Second load should return cached version
        const result = await dynamicImports.loadMonacoEditor();

        expect(result).toEqual({ default: 'MonacoEditorComponent' });
      });

      it('should provide correct Monaco Editor interface', () => {
        expect(dynamicImports.MonacoEditor.component).toBeDefined();
        expect(dynamicImports.MonacoEditor.load).toBe(dynamicImports.loadMonacoEditor);
        expect(dynamicImports.MonacoEditor.isLoaded()).toBe(false);

        expect(typeof dynamicImports.MonacoEditor.load).toBe('function');
        expect(typeof dynamicImports.MonacoEditor.isLoaded).toBe('function');
      });
    });

    describe('PDF Libraries', () => {
      it('should load PDF libraries together', async () => {
        const result = await dynamicImports.loadPDFLibraries();

        expect(result).toEqual({
          jspdf: { default: 'jsPDF' },
          autotable: { default: 'jsPDFAutoTable' }
        });
      });

      it('should cache PDF libraries after first load', async () => {
        // First load
        await dynamicImports.loadPDFLibraries();

        // Second load should return cached version
        const result = await dynamicImports.loadPDFLibraries();

        expect(result).toEqual({
          jspdf: { default: 'jsPDF' },
          autotable: { default: 'jsPDFAutoTable' }
        });
      });

      it('should provide correct PDF Libraries interface', () => {
        expect(dynamicImports.PDFLibraries.component).toBeDefined();
        expect(dynamicImports.PDFLibraries.load).toBe(dynamicImports.loadPDFLibraries);
        expect(dynamicImports.PDFLibraries.isLoaded()).toBe(false);
      });
    });

    describe('React Flow', () => {
      it('should load React Flow library', async () => {
        const result = await dynamicImports.loadReactFlow();

        expect(result).toEqual({ default: 'ReactFlowComponent' });
      });

      it('should cache React Flow after first load', async () => {
        await dynamicImports.loadReactFlow();
        const result = await dynamicImports.loadReactFlow();

        expect(result).toEqual({ default: 'ReactFlowComponent' });
      });

      it('should provide correct React Flow interface', () => {
        expect(dynamicImports.ReactFlow.component).toBeDefined();
        expect(dynamicImports.ReactFlow.load).toBe(dynamicImports.loadReactFlow);
        expect(dynamicImports.ReactFlow.isLoaded()).toBe(false);
      });
    });

    describe('Google AI Libraries', () => {
      it('should load Google AI libraries together', async () => {
        const result = await dynamicImports.loadGoogleAI();

        expect(result).toEqual({
          generativeAI: { default: 'GoogleGenerativeAI' },
          genai: { default: 'GoogleGenAI' }
        });
      });

      it('should cache Google AI libraries after first load', async () => {
        await dynamicImports.loadGoogleAI();
        const result = await dynamicImports.loadGoogleAI();

        expect(result).toEqual({
          generativeAI: { default: 'GoogleGenerativeAI' },
          genai: { default: 'GoogleGenAI' }
        });
      });

      it('should provide correct Google AI interface', () => {
        expect(dynamicImports.GoogleAI.component).toBeDefined();
        expect(dynamicImports.GoogleAI.load).toBe(dynamicImports.loadGoogleAI);
        expect(dynamicImports.GoogleAI.isLoaded()).toBe(false);
      });
    });

    describe('OpenAI Library', () => {
      it('should load OpenAI library', async () => {
        const result = await dynamicImports.loadOpenAI();

        expect(result).toEqual({ default: 'OpenAI' });
      });

      it('should cache OpenAI after first load', async () => {
        await dynamicImports.loadOpenAI();
        const result = await dynamicImports.loadOpenAI();

        expect(result).toEqual({ default: 'OpenAI' });
      });

      it('should provide correct OpenAI interface', () => {
        expect(dynamicImports.OpenAI.component).toBeDefined();
        expect(dynamicImports.OpenAI.load).toBe(dynamicImports.loadOpenAI);
        expect(dynamicImports.OpenAI.isLoaded()).toBe(false);
      });
    });

    describe('Supabase Library', () => {
      it('should load Supabase library', async () => {
        const result = await dynamicImports.loadSupabase();

        expect(result).toEqual({ default: 'SupabaseClient' });
      });

      it('should cache Supabase after first load', async () => {
        await dynamicImports.loadSupabase();
        const result = await dynamicImports.loadSupabase();

        expect(result).toEqual({ default: 'SupabaseClient' });
      });

      it('should provide correct Supabase interface', () => {
        expect(dynamicImports.Supabase.component).toBeDefined();
        expect(dynamicImports.Supabase.load).toBe(dynamicImports.loadSupabase);
        expect(dynamicImports.Supabase.isLoaded()).toBe(false);
      });
    });

    describe('Axios Library', () => {
      it('should load Axios library', async () => {
        const result = await dynamicImports.loadAxios();

        expect(result).toEqual({ default: 'AxiosClient' });
      });

      it('should cache Axios after first load', async () => {
        await dynamicImports.loadAxios();
        const result = await dynamicImports.loadAxios();

        expect(result).toEqual({ default: 'AxiosClient' });
      });

      it('should provide correct Axios interface', () => {
        expect(dynamicImports.Axios.component).toBeDefined();
        expect(dynamicImports.Axios.load).toBe(dynamicImports.loadAxios);
        expect(dynamicImports.Axios.isLoaded()).toBe(false);
      });
    });

    describe('UUID Library', () => {
      it('should load UUID library', async () => {
        const result = await dynamicImports.loadUUID();

        expect(result).toEqual({ default: 'UUID' });
      });

      it('should cache UUID after first load', async () => {
        await dynamicImports.loadUUID();
        const result = await dynamicImports.loadUUID();

        expect(result).toEqual({ default: 'UUID' });
      });

      it('should provide correct UUID interface', () => {
        expect(dynamicImports.UUID.component).toBeDefined();
        expect(dynamicImports.UUID.load).toBe(dynamicImports.loadUUID);
        expect(dynamicImports.UUID.isLoaded()).toBe(false);
      });
    });
  });

  describe('Batch Loading', () => {
    it('should load multiple dependencies at once', async () => {
      const dependencies = ['axios', 'uuid', 'supabase'];

      await dynamicImports.loadHeavyDependencies(dependencies);

      // Verify all were loaded (would be cached now)
      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.UUID.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
    });

    it('should handle empty dependencies array', async () => {
      await expect(dynamicImports.loadHeavyDependencies([])).resolves.toBeUndefined();
    });

    it('should handle unknown dependency gracefully', async () => {
      const dependencies = ['unknown-library' as any];

      await expect(dynamicImports.loadHeavyDependencies(dependencies)).resolves.toBeUndefined();
    });

    it('should handle mixed valid and invalid dependencies', async () => {
      const dependencies = ['axios', 'unknown-library' as any, 'uuid'];

      await expect(dynamicImports.loadHeavyDependencies(dependencies)).resolves.toBeUndefined();

      // Valid ones should still be loaded
      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.UUID.isLoaded()).toBe(true);
    });
  });

  describe('Role-based Preloading', () => {
    it('should preload critical dependencies for all users', async () => {
      await dynamicImports.preloadCriticalDependencies('regular_user');

      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
    });

    it('should preload developer-specific dependencies', async () => {
      await dynamicImports.preloadCriticalDependencies('developer');

      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
      expect(dynamicImports.ReactFlow.isLoaded()).toBe(true);
    });

    it('should preload company admin dependencies', async () => {
      await dynamicImports.preloadCriticalDependencies('company_admin');

      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
      expect(dynamicImports.PDFLibraries.isLoaded()).toBe(true);
    });

    it('should preload super admin dependencies', async () => {
      await dynamicImports.preloadCriticalDependencies('super_admin');

      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
      expect(dynamicImports.GoogleAI.isLoaded()).toBe(true);
    });

    it('should handle unknown user roles gracefully', async () => {
      await expect(dynamicImports.preloadCriticalDependencies('unknown_role')).resolves.toBeUndefined();

      // Should still load basic dependencies
      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
    });
  });

  describe('Route-based Preloading', () => {
    it('should preload developer console dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('developer-console');

      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
    });

    it('should preload automation studio dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('automation-studio');

      expect(dynamicImports.ReactFlow.isLoaded()).toBe(true);
    });

    it('should preload SDK developer dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('sdk-developer');

      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
      expect(dynamicImports.ReactFlow.isLoaded()).toBe(true);
    });

    it('should preload accounting dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('accounting');

      expect(dynamicImports.PDFLibraries.isLoaded()).toBe(true);
    });

    it('should preload documents dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('documents');

      expect(dynamicImports.PDFLibraries.isLoaded()).toBe(true);
    });

    it('should preload AI tools dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('ai-tools');

      expect(dynamicImports.GoogleAI.isLoaded()).toBe(true);
      expect(dynamicImports.OpenAI.isLoaded()).toBe(true);
    });

    it('should preload construction oracle dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('construction-oracle');

      expect(dynamicImports.GoogleAI.isLoaded()).toBe(true);
    });

    it('should preload n8n-procore builder dependencies', async () => {
      await dynamicImports.preloadRouteDependencies('n8n-procore-builder');

      expect(dynamicImports.ReactFlow.isLoaded()).toBe(true);
    });

    it('should handle unknown routes gracefully', async () => {
      await expect(dynamicImports.preloadRouteDependencies('unknown-route')).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle import failures gracefully', async () => {
      // Mock a failing import
      jest.doMock('@monaco-editor/react', () => {
        throw new Error('Import failed');
      }, { virtual: true });

      // Reset the cache for this test
      (dynamicImports as any).monacoPromise = null;
      (dynamicImports as any).monacoModule = null;

      await expect(dynamicImports.loadMonacoEditor()).rejects.toThrow('Import failed');
    });

    it('should handle partial failures in batch loading', async () => {
      // Mock one failing and one successful import
      jest.doMock('axios', () => ({
        default: 'AxiosClient'
      }), { virtual: true });

      jest.doMock('uuid', () => {
        throw new Error('UUID import failed');
      }, { virtual: true });

      // Reset caches
      (dynamicImports as any).axiosPromise = null;
      (dynamicImports as any).axiosModule = null;
      (dynamicImports as any).uuidPromise = null;
      (dynamicImports as any).uuidModule = null;

      const dependencies = ['axios', 'uuid'];

      // Should not throw, but UUID should fail to load
      await dynamicImports.loadHeavyDependencies(dependencies);

      expect(dynamicImports.Axios.isLoaded()).toBe(true);
      expect(dynamicImports.UUID.isLoaded()).toBe(false);
    });
  });

  describe('Caching Behavior', () => {
    it('should update isLoaded status after loading', async () => {
      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(false);

      await dynamicImports.loadMonacoEditor();

      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
    });

    it('should maintain loaded status across multiple calls', async () => {
      await dynamicImports.loadMonacoEditor();

      // Call multiple times
      await dynamicImports.loadMonacoEditor();
      await dynamicImports.loadMonacoEditor();

      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
    });

    it('should handle concurrent load calls', async () => {
      const loadPromises = [
        dynamicImports.loadMonacoEditor(),
        dynamicImports.loadMonacoEditor(),
        dynamicImports.loadMonacoEditor()
      ];

      const results = await Promise.all(loadPromises);

      // All should return the same result
      results.forEach(result => {
        expect(result).toEqual({ default: 'MonacoEditorComponent' });
      });

      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
    });
  });

  describe('DynamicImports Collection', () => {
    it('should export all dynamic import objects', () => {
      expect(dynamicImports.DynamicImports).toBeDefined();
      expect(dynamicImports.DynamicImports.MonacoEditor).toBe(dynamicImports.MonacoEditor);
      expect(dynamicImports.DynamicImports.PDFLibraries).toBe(dynamicImports.PDFLibraries);
      expect(dynamicImports.DynamicImports.ReactFlow).toBe(dynamicImports.ReactFlow);
      expect(dynamicImports.DynamicImports.GoogleAI).toBe(dynamicImports.GoogleAI);
      expect(dynamicImports.DynamicImports.OpenAI).toBe(dynamicImports.OpenAI);
      expect(dynamicImports.DynamicImports.Supabase).toBe(dynamicImports.Supabase);
      expect(dynamicImports.DynamicImports.Axios).toBe(dynamicImports.Axios);
      expect(dynamicImports.DynamicImports.UUID).toBe(dynamicImports.UUID);
    });

    it('should have all required properties for each import', () => {
      Object.values(dynamicImports.DynamicImports).forEach(importObj => {
        expect(importObj).toHaveProperty('component');
        expect(importObj).toHaveProperty('load');
        expect(importObj).toHaveProperty('isLoaded');
        expect(typeof importObj.load).toBe('function');
        expect(typeof importObj.isLoaded).toBe('function');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with React.lazy components', async () => {
      // Load the component first
      await dynamicImports.loadMonacoEditor();

      // The lazy component should be available
      const LazyMonacoComponent = dynamicImports.MonacoEditor.component;

      expect(LazyMonacoComponent).toBeDefined();
      expect(typeof LazyMonacoComponent).toBe('function');
    });

    it('should handle complex dependency chains', async () => {
      // Load multiple related dependencies
      await dynamicImports.loadHeavyDependencies([
        'google-ai',
        'openai',
        'supabase',
        'axios'
      ]);

      expect(dynamicImports.GoogleAI.isLoaded()).toBe(true);
      expect(dynamicImports.OpenAI.isLoaded()).toBe(true);
      expect(dynamicImports.Supabase.isLoaded()).toBe(true);
      expect(dynamicImports.Axios.isLoaded()).toBe(true);
    });

    it('should handle rapid successive loads', async () => {
      // Rapidly load multiple libraries
      const loadPromises = [
        dynamicImports.loadMonacoEditor(),
        dynamicImports.loadPDFLibraries(),
        dynamicImports.loadReactFlow(),
        dynamicImports.loadGoogleAI(),
        dynamicImports.loadOpenAI()
      ];

      const results = await Promise.all(loadPromises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // All should be loaded
      expect(dynamicImports.MonacoEditor.isLoaded()).toBe(true);
      expect(dynamicImports.PDFLibraries.isLoaded()).toBe(true);
      expect(dynamicImports.ReactFlow.isLoaded()).toBe(true);
      expect(dynamicImports.GoogleAI.isLoaded()).toBe(true);
      expect(dynamicImports.OpenAI.isLoaded()).toBe(true);
    });
  });
});