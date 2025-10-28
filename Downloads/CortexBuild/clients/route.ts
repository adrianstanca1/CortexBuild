/**
 * Clients API Routes
 * CRUD operations with multi-tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext, auditLog } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

/**
 * GET /api/clients
 * List all clients for the authenticated user's company
 */
export async function GET(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const client = await setCompanyContext(context.companyId);
            const { searchParams } = req.nextUrl;
            const status = searchParams.get('status');
            const type = searchParams.get('type');
            const search = searchParams.get('search');

            let query = client
                .from('clients')
                .select('*, projects:projects(count)')
                .eq('company_id', context.companyId)
                .order('created_at', { ascending: false });

            if (status) query = query.eq('status', status);
            if (type) query = query.eq('type', type);
            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Failed to fetch clients:', error);
                return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
            }

            return NextResponse.json({ data });
        } catch (error) {
            console.error('Clients GET error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const body = await req.json();

            if (!body.name) {
                return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
            }

            const client = await setCompanyContext(context.companyId);

            const clientData = {
                ...body,
                company_id: context.companyId,
                created_by: context.userId,
                status: body.status || 'active',
            };

            const { data, error } = await client
                .from('clients')
                .insert(clientData)
                .select()
                .single();

            if (error) {
                console.error('Failed to create client:', error);
                return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
            }

            await auditLog(context, 'create', 'client', data.id, null, data);

            return NextResponse.json({ data }, { status: 201 });
        } catch (error) {
            console.error('Clients POST error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

