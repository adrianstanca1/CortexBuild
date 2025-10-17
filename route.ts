/**
 * Time Entries API Routes
 * CRUD operations with time tracking and aggregation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext, auditLog } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const client = await setCompanyContext(context.companyId);
            const { searchParams } = req.nextUrl;
            const projectId = searchParams.get('projectId');
            const userId = searchParams.get('userId');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            const aggregate = searchParams.get('aggregate') === 'true';

            let query = client
                .from('time_entries')
                .select(`
                    *,
                    project:projects(id, name),
                    user:users(id, name)
                `)
                .eq('company_id', context.companyId)
                .order('date', { ascending: false });

            if (projectId) query = query.eq('project_id', projectId);
            if (userId) query = query.eq('user_id', userId);
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);

            const { data, error } = await query;

            if (error) {
                return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
            }

            // Aggregate if requested
            if (aggregate && data) {
                const aggregated = {
                    totalHours: data.reduce((sum, entry) => sum + (entry.hours || 0), 0),
                    totalEntries: data.length,
                    byProject: {} as Record<string, number>,
                    byUser: {} as Record<string, number>,
                    byDate: {} as Record<string, number>,
                };

                data.forEach(entry => {
                    // By project
                    const projectName = entry.project?.name || 'Unknown';
                    aggregated.byProject[projectName] = (aggregated.byProject[projectName] || 0) + entry.hours;

                    // By user
                    const userName = entry.user?.name || 'Unknown';
                    aggregated.byUser[userName] = (aggregated.byUser[userName] || 0) + entry.hours;

                    // By date
                    const date = entry.date;
                    aggregated.byDate[date] = (aggregated.byDate[date] || 0) + entry.hours;
                });

                return NextResponse.json({ data, aggregated });
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

            if (!body.project_id || !body.date || !body.hours) {
                return NextResponse.json(
                    { error: 'Project ID, date, and hours are required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            const timeEntryData = {
                ...body,
                company_id: context.companyId,
                user_id: body.user_id || context.userId,
                status: body.status || 'submitted',
            };

            const { data, error } = await client
                .from('time_entries')
                .insert(timeEntryData)
                .select(`
                    *,
                    project:projects(id, name),
                    user:users(id, name)
                `)
                .single();

            if (error) {
                return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
            }

            await auditLog(context, 'create', 'time_entry', data.id, null, data);

            return NextResponse.json({ data }, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

