import { NextRequest, NextResponse } from 'next/server';
import {
  getProviderCertifications,
  createCertification,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderCertification,
  CreateCertificationRequest,
} from '@/types/provider-specialties';

// GET - Listar certificações do provider
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

    const certifications = await getProviderCertifications(providerId);

    return NextResponse.json<ApiResponse<ProviderCertification[]>>({
      success: true,
      data: certifications,
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch certifications',
      },
      { status: 500 }
    );
  }
}

// POST - Criar nova certificação
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

    const body: CreateCertificationRequest = await request.json();

    // Validações básicas
    if (!body.name || !body.issuer) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const certification = await createCertification(providerId, body);

    return NextResponse.json<ApiResponse<ProviderCertification>>(
      {
        success: true,
        data: certification,
        message: 'Certification created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating certification:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create certification',
      },
      { status: 400 }
    );
  }
}
