/**
 * Authentication API - Register
 * Handles user registration with company creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, createServerClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, companyName } = await req.json();

        if (!email || !password || !name || !companyName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: authError?.message || 'Failed to create account' },
                { status: 400 }
            );
        }

        const client = createServerClient();

        // Create company
        const { data: companyData, error: companyError } = await client
            .from('companies')
            .insert({
                name: companyName,
                email: email,
            })
            .select()
            .single();

        if (companyError) {
            // Rollback auth user
            await supabase.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: 'Failed to create company' },
                { status: 500 }
            );
        }

        // Create user record
        const { data: userData, error: userError } = await client
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                company_id: companyData.id,
                role: 'admin', // First user is admin
                is_active: true,
            })
            .select()
            .single();

        if (userError) {
            // Rollback
            await client.from('companies').delete().eq('id', companyData.id);
            await supabase.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Subscribe to free AI agents
        const { data: freeAgents } = await client
            .from('agents')
            .select('id')
            .eq('pricing_model', 'free')
            .eq('is_active', true);

        if (freeAgents && freeAgents.length > 0) {
            await client.from('company_subscriptions').insert(
                freeAgents.map(agent => ({
                    company_id: companyData.id,
                    agent_id: agent.id,
                    status: 'active',
                }))
            );
        }

        // Auto-login after registration
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully',
                token: loginData?.session?.access_token || null,
                user: {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    company_id: userData.company_id,
                },
                session: loginData?.session ? {
                    access_token: loginData.session.access_token,
                    refresh_token: loginData.session.refresh_token,
                    expires_at: loginData.session.expires_at,
                } : null,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

