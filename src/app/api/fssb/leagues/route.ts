import { NextRequest, NextResponse } from 'next/server';
import FssbApiService from '@/services/fssbApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId');
    
    if (!sportId) {
      return NextResponse.json(
        { error: 'sportId é obrigatório' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Usar a classe diretamente
    const fssbApi = FssbApiService.getInstance();
    const data = await fssbApi.getLeagues({ sportId });
    
    // Retornar os dados com headers CORS apropriados
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ [FSSB Route] Erro ao buscar ligas:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar ligas', 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handler para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
