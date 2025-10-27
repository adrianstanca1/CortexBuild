import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User } from './types';

// Use environment variables directly - no global variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to check if URL is valid
const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
};

// Configuration check
const isUrlValid = isValidUrl(supabaseUrl);
const isKeyValid = supabaseAnonKey && supabaseAnonKey.length > 0 && !supabaseAnonKey.includes('YOUR_') && !supabaseAnonKey.includes('example');

if (!isUrlValid || !isKeyValid) {
    console.warn('⚠️ Supabase not configured properly');
    console.warn('URL Valid:', isUrlValid);
    console.warn('Key Valid:', isKeyValid);
}

let supabaseInstance: SupabaseClient | null = null;

if (isUrlValid && isKeyValid) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        // Store globally to avoid multiple client instances
        if (typeof window !== 'undefined') {
            (window as any).supabaseClient = supabaseInstance;
        }
        console.log('✅ Supabase client initialized successfully!');
    } catch (e) {
        console.error("❌ Failed to initialize Supabase client:", e);
    }
} else {
    console.warn('⚠️ Supabase is not configured. Falling back to mock auth.');
}

export const supabase = supabaseInstance;

export const getMyProfile = async (): Promise<User | null> => {
    if (!supabase) {
        return null;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return null;
    }

    const user = session.user;
    let profile = null;

    // Try users table first (our main table)
    try {
        console.log('📊 [getMyProfile] Fetching from users table...');
        const result = await supabase
            .from('users')
            .select('id, name, email, role, avatar, company_id')
            .eq('id', user.id)
            .single();

        profile = result.data;
        if (profile) {
            console.log('✅ [getMyProfile] Profile found in users table:', profile.name);
        }
    } catch (error) {
        console.warn('⚠️ [getMyProfile] Users table failed:', error);
    }

    // If not found in users table, try profiles table as fallback
    if (!profile) {
        try {
            console.log('📊 [getMyProfile] Trying profiles table...');
            const result = await supabase
                .from('profiles')
                .select('id, name, email, role, avatar, company_id')
                .eq('id', user.id)
                .single();

            profile = result.data;
            if (profile) {
                console.log('✅ [getMyProfile] Profile found in profiles table:', profile.name);
            }
        } catch (error) {
            console.warn('⚠️ [getMyProfile] Profiles table also failed:', error);
        }
    }

    // If no profile exists in either table, create from user metadata
    if (!profile) {
        console.warn('⚠️ [getMyProfile] No profile in database, creating from metadata');
        profile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] || 'User',
            role: user.email === 'adrian.stanca1@gmail.com' ? 'super_admin' : 'company_admin',
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            company_id: undefined
        };
        console.log('✅ [getMyProfile] Created profile from metadata:', profile);
    }

    // Manual mapping from snake_case to camelCase
    return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
        companyId: profile.company_id,
    };
};