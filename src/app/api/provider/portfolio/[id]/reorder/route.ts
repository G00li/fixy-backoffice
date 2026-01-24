import { NextRequest, NextResponse } from 'next/server';
import { reorderPortfolioItems } from '@/lib/api/provider-specialties';
import type { ApiResponse, ReorderPortfolioRequest } from '@/types/provider-specialties';

// POST - Reordenar items do portfolio
export async function POST(request: NextRequest) {
  try {
    // TODO: Obter providerId do usuário autenticado
    const providerId = request.headers.get('x-provider-id');
    
    if (!providerId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Provider ID is required',
        },
        { status: 401 }
      );
    }

    const body: ReorderPortfolioRequest = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid items array',
        },
        { status: 400 }
      );
    }

    await reorderPortfolioItems(providerId, body.items);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Portfolio items reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering portfolio items:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder portfolio items',
      },
      { status: 400 }
    );
  }
}
