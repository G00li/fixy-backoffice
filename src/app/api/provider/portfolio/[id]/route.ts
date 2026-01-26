import { NextRequest, NextResponse } from 'next/server';
import {
  updatePortfolioItem,
  deletePortfolioItem,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderPortfolioItem,
  UpdatePortfolioRequest,
} from '@/types/provider-specialties';

// PUT - Atualizar item de portfolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body: UpdatePortfolioRequest = await request.json();

    const item = await updatePortfolioItem(id, providerId, body);

    return NextResponse.json<ApiResponse<ProviderPortfolioItem>>({
      success: true,
      data: item,
      message: 'Portfolio item updated successfully',
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update portfolio item',
      },
      { status: 400 }
    );
  }
}

// DELETE - Remover item de portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await deletePortfolioItem(id, providerId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete portfolio item',
      },
      { status: 400 }
    );
  }
}
