/**
 * Single Client API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext, auditLog, validateResourceOwnership } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

interface RouteParams {
    params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { id } = params;
            const hasAccess = await validateResourceOwnership(context.companyId, 'clients', id);
            if (!hasAccess) {
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            const client = await setCompanyContext(context.companyId);
            const { data, error } = await client
                .from('clients')
                .select('*, projects:projects(id, name, status, budget)')
                .eq('id', id)
                .single();

            if (error) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            return NextResponse.json({ data });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { id } = params;
            const body = await req.json();
            const hasAccess = await validateResourceOwnership(context.companyId, 'clients', id);
            if (!hasAccess) {
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            const client = await setCompanyContext(context.companyId);
            const { data: oldData } = await client.from('clients').select('*').eq('id', id).single();

            const { data, error } = await client
                .from('clients')
                .update({ ...body, company_id: context.companyId })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
            }

            await auditLog(context, 'update', 'client', id, oldData, data);
            return NextResponse.json({ data });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { id } = params;
            const hasAccess = await validateResourceOwnership(context.companyId, 'clients', id);
            if (!hasAccess) {
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            const client = await setCompanyContext(context.companyId);
            const { data: oldData } = await client.from('clients').select('*').eq('id', id).single();
            const { error } = await client.from('clients').delete().eq('id', id);

            if (error) {
                return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
            }

            await auditLog(context, 'delete', 'client', id, oldData, null);
            return NextResponse.json({ success: true });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

