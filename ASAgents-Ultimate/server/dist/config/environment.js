const environments = {
    development: {
        name: 'development',
        apiUrl: 'http://localhost:4000/api',
        authUrl: 'http://localhost:4000/auth',
        isDevelopment: true,
        isProduction: false,
        oauth: {
            google: {
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                enabled: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
            },
            github: {
                clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
                enabled: !!import.meta.env.VITE_GITHUB_CLIENT_ID,
            },
            oauthIo: {
                publicKey: import.meta.env.VITE_OAUTH_IO_PUBLIC_KEY || '',
                enabled: !!import.meta.env.VITE_OAUTH_IO_PUBLIC_KEY,
            },
        },
        features: {
            allowMockFallback: import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'false',
            useSupabase: import.meta.env.VITE_USE_SUPABASE === 'true',
        },
        gemini: {
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
            browserKey: import.meta.env.VITE_GEMINI_BROWSER_KEY || '',
            enabled: !!(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_BROWSER_KEY),
        },
    },
    production: {
        name: 'production',
        apiUrl: '/api',
        authUrl: '/auth',
        isDevelopment: false,
        isProduction: true,
        oauth: {
            google: {
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                enabled: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
            },
            github: {
                clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
                enabled: !!import.meta.env.VITE_GITHUB_CLIENT_ID,
            },
            oauthIo: {
                publicKey: import.meta.env.VITE_OAUTH_IO_PUBLIC_KEY || '',
                enabled: !!import.meta.env.VITE_OAUTH_IO_PUBLIC_KEY,
            },
        },
        features: {
            allowMockFallback: import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'false',
            useSupabase: import.meta.env.VITE_USE_SUPABASE === 'true',
        },
        gemini: {
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
            browserKey: import.meta.env.VITE_GEMINI_BROWSER_KEY || '',
            enabled: !!(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_BROWSER_KEY),
        },
    },
};
let currentEnvironment = environments.development;
export const getEnvironment = () => {
    return currentEnvironment;
};
export const refreshEnvironment = () => {
    const env = import.meta.env.MODE || 'development';
    currentEnvironment = environments[env] || environments.development;
};
export const getEnvironmentSnapshot = () => {
    return {
        ...currentEnvironment,
        timestamp: new Date().toISOString(),
    };
};
// Initialize environment
refreshEnvironment();
