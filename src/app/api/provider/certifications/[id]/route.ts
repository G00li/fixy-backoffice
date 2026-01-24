import { NextRequest, NextResponse } from 'next/server';
import {
  updateCertification,
  deleteCertification,
} from '@/lib/api/provider-specialties';
import type {
  ApiResponse,
  ProviderCertification,
  UpdateCertificationRequest,
} from '@/types/provider-specialties';

// PUT - Atualizar certificação
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

    const body: UpdateCertificationRequest = await request.json();

    const certification = await updateCertification(params.id, providerId, body);

    return NextResponse.json<ApiResponse<ProviderCertification>>({
      success: true,
      data: certification,
      message: 'Certification updated successfully',
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update certification',
      },
      { status: 400 }
    );
  }
}

// DELETE - Remover certificação
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

    await deleteCertification(params.id, providerId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Certification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete certification',
      },
      { status: 400 }
    );
  }
}
