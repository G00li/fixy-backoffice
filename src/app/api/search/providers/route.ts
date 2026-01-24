import { NextRequest, NextResponse } from 'next/server';
import { searchProviders } from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  SearchProvidersRequest,
  ProviderSearchResult,
} from '@/types/provider-specialties';

// POST - Busca avançada de providers
export async function POST(request: NextRequest) {
  try {
    const body: SearchProvidersRequest = await request.json();

    const results = await searchProviders(body);

    return NextResponse.json<ApiResponse<ProviderSearchResult[]>>({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching providers:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search providers',
      },
      { status: 500 }
    );
  }
}
