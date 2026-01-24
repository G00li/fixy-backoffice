import { NextRequest, NextResponse } from 'next/server';
import {
  updateProviderSpecialty,
  deleteProviderSpecialty,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderCategory,
  UpdateSpecialtyRequest,
} from '@/types/provider-specialties';

// PUT - Atualizar especialidade
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body: UpdateSpecialtyRequest = await request.json();

    const specialty = await updateProviderSpecialty(params.id, providerId, body);

    return NextResponse.json<ApiResponse<ProviderCategory>>({
      success: true,
      data: specialty,
      message: 'Specialty updated successfully',
    });
  } catch (error) {
    console.error('Error updating specialty:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update specialty',
      },
      { status: 400 }
    );
  }
}

// DELETE - Remover especialidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await deleteProviderSpecialty(params.id, providerId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Specialty deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting specialty:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete specialty',
      },
      { status: 400 }
    );
  }
}
