import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/api/provider-specialties';
import type { ApiResponse, Category } from '@/types/provider-specialties';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const parentId = searchParams.get('parent_id');

    const categories = await getCategories(
      level ? (parseInt(level) as 1 | 2) : undefined,
      parentId || undefined
    );

    return NextResponse.json<ApiResponse<Category[]>>({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
