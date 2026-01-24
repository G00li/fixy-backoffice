import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById } from '@/lib/api/provider-specialties';
import type { ApiResponse, Category } from '@/types/provider-specialties';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);

    return NextResponse.json<ApiResponse<Category>>({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category',
      },
      { status: 404 }
    );
  }
}
