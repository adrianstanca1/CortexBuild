import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return a default tenant setup
    // In a real application, this would fetch from a database
    const tenants = [
      {
        id: 'default',
        name: 'CortexBuild Platform',
        domain: 'localhost',
        settings: {
          theme: 'light',
          features: ['dashboard', 'projects', 'ai-agents']
        }
      }
    ];

    const currentTenant = tenants[0];

    return NextResponse.json({
      tenants,
      currentTenant,
      success: true
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tenants',
        success: false
      },
      { status: 500 }
    );
  }
}