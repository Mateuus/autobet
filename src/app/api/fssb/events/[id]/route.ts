import { NextRequest, NextResponse } from 'next/server';
import FssbApiService from '@/services/fssbApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Buscando detalhes do evento:', eventId);

    // Buscar detalhes do evento usando o serviço FSSB
    const fssbApi = new FssbApiService();
    const eventDetails = await fssbApi.getEventDetails({ eventId });

    console.log('✅ [API] Detalhes do evento obtidos com sucesso');

    return NextResponse.json(eventDetails);
  } catch (error) {
    console.error('❌ [API] Erro ao buscar detalhes do evento:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
