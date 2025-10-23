import { NextResponse } from 'next/server';
import { fssbApi } from '@/services/fssbApi';

export async function GET() {
  try {
    // Usar o fssbApi que já gerencia tokens automaticamente
    const data = await fssbApi.getSports();
    
    // Retornar os dados com headers CORS apropriados
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ [FSSB Route] Erro ao buscar esportes:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar esportes', 
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
