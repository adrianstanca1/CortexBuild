// Minimal Supabase client stub for build-time type satisfaction
// Replace with a real Supabase client configuration in production

export const supabase = {
  storage: {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: any, _opts?: any) => ({ data: null as any, error: null as any }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: _path }, error: null as any }),
      remove: async (_paths: string[]) => ({ data: null as any, error: null as any }),
    }),
  },
  channel: (_name: string) => ({
    on: (_event: any, _filter: any, _cb: any) => ({ subscribe: () => ({}) }),
  }),
} as const;

