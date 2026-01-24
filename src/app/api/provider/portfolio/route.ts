import { NextRequest, NextResponse } from 'next/server';
import {
  getProviderPortfolio,
  createPortfolioItem,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderPortfolioItem,
  CreatePortfolioRequest,
} from '@/types/provider-specialties';

// GET - Listar portfolio do provider
export async function GET(request: NextRequest) {
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

    const portfolio = await getProviderPortfolio(providerId);

    return NextResponse.json<ApiResponse<ProviderPortfolioItem[]>>({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
      },
      { status: 500 }
    );
  }
}

// POST - Criar novo item de portfolio
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

    const body: CreatePortfolioRequest = await request.json();

    // Validações básicas
    if (!body.title || !body.media_type || !body.media_url) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const item = await createPortfolioItem(providerId, body);

    return NextResponse.json<ApiResponse<ProviderPortfolioItem>>(
      {
        success: true,
        data: item,
        message: 'Portfolio item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create portfolio item',
      },
      { status: 400 }
    );
  }
}
