import { lazy, ComponentType } from 'react';

// Dynamic import utilities for heavy dependencies
export interface DynamicImport<T = any> {
  component: ComponentType<T>;
  load: () => Promise<void>;
  isLoaded: () => boolean;
}

// Monaco Editor - Heavy code editor
let monacoPromise: Promise<any> | null = null;
let monacoModule: any = null;

export const loadMonacoEditor = (): Promise<any> => {
  if (monacoModule) return Promise.resolve(monacoModule);

  if (!monacoPromise) {
    monacoPromise = import('@monaco-editor/react').then(module => {
      monacoModule = module;
      return module;
    });
  }

  return monacoPromise;
};

export const MonacoEditor: DynamicImport = {
  component: lazy(() => loadMonacoEditor()),
  load: loadMonacoEditor,
  isLoaded: () => monacoModule !== null
};

// PDF Libraries - Heavy PDF generation and manipulation
let pdfPromise: Promise<any> | null = null;
let pdfModule: any = null;

export const loadPDFLibraries = (): Promise<any> => {
  if (pdfModule) return Promise.resolve(pdfModule);

  if (!pdfPromise) {
    pdfPromise = Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jspdf, autotable]) => {
      pdfModule = { jspdf, autotable };
      return pdfModule;
    });
  }

  return pdfPromise;
};

export const PDFLibraries: DynamicImport = {
  component: lazy(() => loadPDFLibraries()),
  load: loadPDFLibraries,
  isLoaded: () => pdfModule !== null
};

// React Flow - Heavy diagramming library
let reactFlowPromise: Promise<any> | null = null;
let reactFlowModule: any = null;

export const loadReactFlow = (): Promise<any> => {
  if (reactFlowModule) return Promise.resolve(reactFlowModule);

  if (!reactFlowPromise) {
    reactFlowPromise = import('@xyflow/react').then(module => {
      reactFlowModule = module;
      return module;
    });
  }

  return reactFlowModule;
};

export const ReactFlow: DynamicImport = {
  component: lazy(() => loadReactFlow()),
  load: loadReactFlow,
  isLoaded: () => reactFlowModule !== null
};

// Google AI Libraries - AI and ML services
let googleAIPromise: Promise<any> | null = null;
let googleAIModule: any = null;

export const loadGoogleAI = (): Promise<any> => {
  if (googleAIModule) return Promise.resolve(googleAIModule);

  if (!googleAIPromise) {
    googleAIPromise = Promise.all([
      import('@google/generative-ai'),
      import('@google/genai')
    ]).then(([generativeAI, genai]) => {
      googleAIModule = { generativeAI, genai };
      return googleAIModule;
    });
  }

  return googleAIModule;
};

export const GoogleAI: DynamicImport = {
  component: lazy(() => loadGoogleAI()),
  load: loadGoogleAI,
  isLoaded: () => googleAIModule !== null
};

// OpenAI Library - AI services
let openAIPromise: Promise<any> | null = null;
let openAIModule: any = null;

export const loadOpenAI = (): Promise<any> => {
  if (openAIModule) return Promise.resolve(openAIModule);

  if (!openAIPromise) {
    openAIPromise = import('openai').then(module => {
      openAIModule = module;
      return module;
    });
  }

  return openAIModule;
};

export const OpenAI: DynamicImport = {
  component: lazy(() => loadOpenAI()),
  load: loadOpenAI,
  isLoaded: () => openAIModule !== null
};

// Supabase Client - Database and auth services
let supabasePromise: Promise<any> | null = null;
let supabaseModule: any = null;

export const loadSupabase = (): Promise<any> => {
  if (supabaseModule) return Promise.resolve(supabaseModule);

  if (!supabasePromise) {
    supabasePromise = import('@supabase/supabase-js').then(module => {
      supabaseModule = module;
      return module;
    });
  }

  return supabaseModule;
};

export const Supabase: DynamicImport = {
  component: lazy(() => loadSupabase()),
  load: loadSupabase,
  isLoaded: () => supabaseModule !== null
};

// Axios - HTTP client
let axiosPromise: Promise<any> | null = null;
let axiosModule: any = null;

export const loadAxios = (): Promise<any> => {
  if (axiosModule) return Promise.resolve(axiosModule);

  if (!axiosPromise) {
    axiosPromise = import('axios').then(module => {
      axiosModule = module;
      return module;
    });
  }

  return axiosModule;
};

export const Axios: DynamicImport = {
  component: lazy(() => loadAxios()),
  load: loadAxios,
  isLoaded: () => axiosModule !== null
};

// UUID Library - Utility for generating IDs
let uuidPromise: Promise<any> | null = null;
let uuidModule: any = null;

export const loadUUID = (): Promise<any> => {
  if (uuidModule) return Promise.resolve(uuidModule);

  if (!uuidPromise) {
    uuidPromise = import('uuid').then(module => {
      uuidModule = module;
      return module;
    });
  }

  return uuidModule;
};

export const UUID: DynamicImport = {
  component: lazy(() => loadUUID()),
  load: loadUUID,
  isLoaded: () => uuidModule !== null
};

// Batch loading utility for multiple heavy dependencies
export const loadHeavyDependencies = async (dependencies: string[]): Promise<void> => {
  const loadPromises = dependencies.map(dep => {
    switch (dep) {
      case 'monaco':
        return loadMonacoEditor();
      case 'pdf':
        return loadPDFLibraries();
      case 'react-flow':
        return loadReactFlow();
      case 'google-ai':
        return loadGoogleAI();
      case 'openai':
        return loadOpenAI();
      case 'supabase':
        return loadSupabase();
      case 'axios':
        return loadAxios();
      case 'uuid':
        return loadUUID();
      default:
        return Promise.resolve();
    }
  });

  await Promise.all(loadPromises);
};

// Preload critical dependencies based on user role
export const preloadCriticalDependencies = (userRole: string): Promise<void> => {
  const criticalDeps = ['axios', 'supabase']; // Always needed

  switch (userRole) {
    case 'developer':
      criticalDeps.push('monaco', 'react-flow');
      break;
    case 'company_admin':
      criticalDeps.push('pdf');
      break;
    case 'super_admin':
      criticalDeps.push('google-ai');
      break;
    default:
      // Regular users might need basic AI features
      criticalDeps.push('google-ai');
  }

  return loadHeavyDependencies(criticalDeps);
};

// Smart loading based on current route
export const preloadRouteDependencies = (route: string): Promise<void> => {
  const routeDepMap: Record<string, string[]> = {
    'developer-console': ['monaco'],
    'automation-studio': ['react-flow'],
    'sdk-developer': ['monaco', 'react-flow'],
    'accounting': ['pdf'],
    'documents': ['pdf'],
    'ai-tools': ['google-ai', 'openai'],
    'construction-oracle': ['google-ai'],
    'n8n-procore-builder': ['react-flow']
  };

  const deps = routeDepMap[route] || [];
  return loadHeavyDependencies(deps);
};

// Export all dynamic imports for easy access
export const DynamicImports = {
  MonacoEditor,
  PDFLibraries,
  ReactFlow,
  GoogleAI,
  OpenAI,
  Supabase,
  Axios,
  UUID
};