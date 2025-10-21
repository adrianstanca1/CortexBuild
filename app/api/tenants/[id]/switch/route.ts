import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // For now, return success for any tenant switch
    // In a real application, this would:
    // 1. Validate the tenant exists
    // 2. Update user's session/tenant context
    // 3. Handle any tenant-specific logic

    return NextResponse.json({
      success: true,
      message: `Successfully switched to tenant ${id}`,
      tenantId: id
    });
  } catch (error) {
    console.error('Error switching tenant:', error);
    return NextResponse.json(
      {
        error: 'Failed to switch tenant',
        success: false
      },
      { status: 500 }
    );
  }
}