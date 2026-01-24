import { NextRequest, NextResponse } from 'next/server';
import { getCategoryTags } from '@/lib/api/provider-specialties';
import type { ApiResponse, CategorySpecialtyTag } from '@/types/provider-specialties';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    const tags = await getCategoryTags(
      params.id,
      limit ? parseInt(limit) : 20
    );

    return NextResponse.json<ApiResponse<CategorySpecialtyTag[]>>({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Error fetching category tags:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}
