/**
 * Invoices API Routes
 * CRUD operations with payment tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext, auditLog } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const client = await setCompanyContext(context.companyId);
            const { searchParams } = req.nextUrl;
            const status = searchParams.get('status');
            const projectId = searchParams.get('projectId');

            let query = client
                .from('invoices')
                .select(`
                    *,
                    project:projects(id, name),
                    client:clients(id, name)
                `)
                .eq('company_id', context.companyId)
                .order('invoice_date', { ascending: false });

            if (status) query = query.eq('status', status);
            if (projectId) query = query.eq('project_id', projectId);

            const { data, error } = await query;

            if (error) {
                return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
            }

            return NextResponse.json({ data });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

export async function POST(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const body = await req.json();

            if (!body.project_id || !body.amount) {
                return NextResponse.json(
                    { error: 'Project ID and amount are required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            const invoiceData = {
                ...body,
                company_id: context.companyId,
                created_by: context.userId,
                status: body.status || 'draft',
                invoice_number: body.invoice_number || `INV-${Date.now()}`,
            };

            const { data, error } = await client
                .from('invoices')
                .insert(invoiceData)
                .select(`
                    *,
                    project:projects(id, name),
                    client:clients(id, name)
                `)
                .single();

            if (error) {
                return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
            }

            await auditLog(context, 'create', 'invoice', data.id, null, data);

            return NextResponse.json({ data }, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

