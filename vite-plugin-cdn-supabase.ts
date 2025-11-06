// Vite plugin to replace Supabase imports with CDN version
import type { Plugin } from 'vite';

export function cdnSupabasePlugin(): Plugin {
  return {
    name: 'vite-plugin-cdn-supabase',
    enforce: 'pre',

    resolveId(id) {
      // Intercept all Supabase imports
      if (id.startsWith('@supabase/')) {
        // Return external to prevent bundling
        return {
          id,
          external: true
        };
      }
      return null;
    },

    load(id) {
      // Let browser resolve via importmap
      if (id.startsWith('@supabase/')) {
        return {
          code: `export * from '${id}';`,
          map: null
        };
      }
      return null;
    }
  };
}
