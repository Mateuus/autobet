// Teste da API BiaHosted
import { biaHostedApi } from './src/services/biaHostedApi';

async function testApi() {
  try {
    console.log('🧪 Testando API BiaHosted...');
    
    // Testar com sportId 66 (Futebol)
    const events = await biaHostedApi.getEventsList({
      sportId: 66,
      date: new Date()
    });
    
    console.log('✅ Sucesso! Eventos encontrados:', events.events?.length || 0);
    console.log('📅 Datas disponíveis:', events.dates?.length || 0);
    
    if (events.events && events.events.length > 0) {
      console.log('🎯 Primeiro evento:', {
        id: events.events[0].id,
        name: events.events[0].name,
        startDate: events.events[0].startDate,
        sportId: events.events[0].sportId
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste se chamado diretamente
if (typeof window === 'undefined') {
  testApi();
}

export { testApi };
