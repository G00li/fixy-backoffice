import { NextRequest, NextResponse } from 'next/server';
import {
  getProviderSpecialties,
  createProviderSpecialty,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderCategory,
  CreateSpecialtyRequest,
} from '@/types/provider-specialties';

// GET - Listar especialidades do provider
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

    const specialties = await getProviderSpecialties(providerId);

    return NextResponse.json<ApiResponse<ProviderCategory[]>>({
      success: true,
      data: specialties,
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch specialties',
      },
      { status: 500 }
    );
  }
}

// POST - Criar nova especialidade
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

    const body: CreateSpecialtyRequest = await request.json();

    // Validações básicas
    if (!body.category_id || !body.category_type || !body.display_order) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const specialty = await createProviderSpecialty(providerId, body);

    return NextResponse.json<ApiResponse<ProviderCategory>>(
      {
        success: true,
        data: specialty,
        message: 'Specialty created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating specialty:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create specialty',
      },
      { status: 400 }
    );
  }
}
