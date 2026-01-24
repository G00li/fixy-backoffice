import { NextRequest, NextResponse } from 'next/server';
import { getCompleteProviderProfile } from '@/lib/api/provider-specialties';
import type { ApiResponse, CompleteProviderProfile } from '@/types/provider-specialties';

// GET - Obter perfil completo do provider
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('provider_id');
    
    if (!providerId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Provider ID is required',
        },
        { status: 400 }
      );
    }

    const profile = await getCompleteProviderProfile(providerId);

    return NextResponse.json<ApiResponse<CompleteProviderProfile>>({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}
