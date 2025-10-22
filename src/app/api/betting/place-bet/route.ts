import { NextRequest, NextResponse } from 'next/server';

interface BettingOdd {
  id: number;
  marketId: number;
  price: number;
  marketName: string;
  marketTypeId: number;
  mostBalanced: boolean;
  selectionTypeId: number;
  selectionName: string;
  widgetInfo: {
    widget: number;
    page: number;
    tabIndex: number;
    tipsterId: number | null;
    suggestionType: number | null;
  };
}

interface BettingEvent {
  id: number;
  isBanker: boolean;
  dbId: number;
  sportName: string;
  rC: boolean;
  eventName: string;
  catName: string;
  champName: string;
  sportTypeId: number;
  odds: BettingOdd[];
}

interface BettingPayload {
  data: {
    betMarkets: BettingEvent[];
    stakes: number[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BettingPayload = await request.json();
    
    console.log('🎯 Recebido payload do frontend:', JSON.stringify(body, null, 2));
    
    // Aqui você pode processar os dados conforme necessário
    const { data } = body;
    const { betMarkets, stakes } = data;
    
    console.log('📊 Análise dos dados:');
    console.log(`- Número de eventos: ${betMarkets.length}`);
    console.log(`- Número de stakes: ${stakes.length}`);
    console.log(`- Tipo de aposta: ${betMarkets.length === 1 ? 'Simples' : 'Múltipla'}`);
    
    // Log detalhado de cada evento
    betMarkets.forEach((event: BettingEvent, index: number) => {
      console.log(`\n🏆 Evento ${index + 1}:`);
      console.log(`  - ID: ${event.id}`);
      console.log(`  - Nome: ${event.eventName}`);
      console.log(`  - Esporte: ${event.sportName}`);
      console.log(`  - Campeonato: ${event.champName}`);
      console.log(`  - Categoria: ${event.catName}`);
      console.log(`  - Número de odds: ${event.odds.length}`);
      
      event.odds.forEach((odd: BettingOdd, oddIndex: number) => {
        console.log(`    Odd ${oddIndex + 1}:`);
        console.log(`      - ID: ${odd.id}`);
        console.log(`      - Seleção: ${odd.selectionName}`);
        console.log(`      - Preço: ${odd.price}`);
        console.log(`      - Mercado: ${odd.marketName}`);
        console.log(`      - Stake: R$ ${stakes[oddIndex] || 0}`);
      });
    });
    
    // Simular processamento
    const totalStake = stakes.reduce((sum: number, stake: number) => sum + stake, 0);
    const totalOdds = betMarkets.reduce((total: number, event: BettingEvent) => {
      return total * event.odds.reduce((eventTotal: number, odd: BettingOdd) => eventTotal * odd.price, 1);
    }, 1);
    const potentialWin = totalStake * totalOdds;
    
    console.log('\n💰 Resumo da aposta:');
    console.log(`- Stake total: R$ ${totalStake.toFixed(2)}`);
    console.log(`- Odds total: ${totalOdds.toFixed(2)}`);
    console.log(`- Ganho potencial: R$ ${potentialWin.toFixed(2)}`);
    
    // Simular resposta do backend
    const response = {
      success: true,
      message: 'Aposta processada com sucesso',
      betId: `BET_${Date.now()}`,
      summary: {
        totalStake,
        totalOdds,
        potentialWin,
        betType: betMarkets.length === 1 ? 'simples' : 'multipla',
        eventsCount: betMarkets.length,
        selectionsCount: betMarkets.reduce((total: number, event: BettingEvent) => total + event.odds.length, 0)
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Resposta enviada para o frontend:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao processar aposta:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
