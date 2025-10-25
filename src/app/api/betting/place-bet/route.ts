import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { getPlatformInstance } from '@/lib/utils/platformFactory';
import { BetData, LoginCredentials } from '@/types';
import { OddsStateResponse, OddsStatesApiResponse } from '@/services/biaHostedApi';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';

// Interface estendida para PlatformToken com campos específicos do FSSB (comentada por enquanto)
// interface FssbPlatformToken extends PlatformToken {
//   platformCustomerId?: number;
// }

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

interface FssbBetData {
  selections: Array<{
    selectionId: string;
    viewKey: number;
    isCrossBet: boolean;
    isAddedToBetslip: boolean;
    isDynamicMarket: boolean;
    isBetBuilderBet: boolean;
  }>;
  stakes: number[];
}

interface BettingPayload {
  platform?: string;
  data: {
    betMarkets?: BettingEvent[];
    selections?: Array<{
      selectionId: string;
      viewKey: number;
      isCrossBet: boolean;
      isAddedToBetslip: boolean;
      isDynamicMarket: boolean;
      isBetBuilderBet: boolean;
    }>;
    stakes: number[];
  };
}

/**
 * Interface para resultado da separação de contas por saldo
 */
interface AccountBalanceResult {
  sufficientBalance: BetAccount[];
  insufficientBalance: BetAccount[];
  totalRequired: number;
  totalAvailable: number;
}

/**
 * Interface para resultado individual de uma aposta
 */
interface BettingResult {
  accountId: string;
  site: string;
  platform: string;
  success: boolean;
  betId?: string;
  error?: string;
  stake: number;
  balance: number;
  newBalance?: number;
  processingTime: number;
  timestamp: string;
}

/**
 * Interface para resultado do worker de apostas
 */
interface BettingWorkerResult {
  totalAccounts: number;
  successfulBets: number;
  failedBets: number;
  totalStake: number;
  totalProcessingTime: number;
  results: BettingResult[];
  summary: {
    totalRequired: number;
    totalAvailable: number;
    totalProcessed: number;
    successRate: number;
  };
}


/**
 * Gera um ID aleatório no formato especificado
 * @returns String com ID aleatório entre 20 e 22 caracteres
 */
function generateRandomRequestId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 3) + 20; // 20, 21 ou 22 caracteres
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Atualiza as odds do betData com os valores mais recentes da API
 * @param betData - Dados da aposta
 * @param integration - Integration da plataforma
 * @returns Promise<boolean> - true se odds foram atualizadas, false caso contrário
 */
async function updateOddsInBetData(betData: BetData, integration: string): Promise<boolean> {
  try {
    console.log(`📊 Atualizando odds para integration: ${integration}`);
    
    // Extrair odds do betData para verificação
    const oddsToCheck = betData.betMarkets.flatMap(market => 
      market.odds.map(odd => ({
        oddId: Number(odd.id),
        price: odd.price,
        eventId: Number(market.id),
        marketTypeId: odd.marketTypeId,
        selectionTypeId: odd.selectionTypeId,
        sportTypeId: market.sportTypeId,
        isBoost: false,
        marketSliceType: 0
      }))
    );
    
    const { biaHostedApi } = await import('@/services/biaHostedApi');
    const response: OddsStatesApiResponse = await biaHostedApi.getOddsStates({
      integration: integration,
      odds: oddsToCheck
    });
    
    console.log(`✅ Odds atualizadas para ${integration}:`, response);
    
    // A API retorna { oddStates: [] }, então precisamos extrair o array
    const oddsStates: OddsStateResponse[] = response.oddStates || [];
    
    // Verificar se alguma odd mudou significativamente
    const oddsChanged = oddsStates.some((state: OddsStateResponse) => {
      const originalOdd = oddsToCheck.find(odd => odd.oddId === Number(state.id)); // API usa 'id' ao invés de 'oddId'
      return originalOdd && Math.abs(state.price - originalOdd.price) > 0.01;
    });
    
    if (oddsChanged) {
      console.log(`⚠️ Odds mudaram para ${integration}, atualizando betData...`);
      // Atualizar preços no betData com as odds mais recentes
      betData.betMarkets.forEach(market => {
        market.odds.forEach(odd => {
          const updatedOdd = oddsStates.find((state: OddsStateResponse) => Number(state.id) === odd.id); // API usa 'id' ao invés de 'oddId'
          if (updatedOdd) {
            console.log(`🔄 Atualizando odd ${odd.id}: ${odd.price} → ${updatedOdd.price}`);
            odd.price = updatedOdd.price;
          }
        });
      });
      return true;
    }
    
    return false;
    
  } catch (oddsError) {
    console.warn(`⚠️ Erro ao atualizar odds para ${integration}:`, oddsError);
    return false;
  }
}

/**
 * Separa as contas ativas em duas categorias: com saldo suficiente e sem saldo suficiente
 * @param accounts - Array de contas ativas
 * @param requiredBalance - Saldo mínimo necessário em centavos
 * @returns Objeto com contas separadas por saldo
 */
function separateAccountsByBalance(accounts: BetAccount[], requiredBalance: number): AccountBalanceResult {
  const sufficientBalance: BetAccount[] = [];
  const insufficientBalance: BetAccount[] = [];
  
  let totalAvailable = 0;
  
  accounts.forEach(account => {
    totalAvailable += account.balance;
    
    if (account.balance >= requiredBalance) {
      sufficientBalance.push(account);
    } else {
      insufficientBalance.push(account);
    }
  });
  
  console.log(`💰 Análise de saldo:`);
  console.log(`  - Saldo necessário: R$ ${(requiredBalance / 100).toFixed(2)}`);
  console.log(`  - Saldo total disponível: R$ ${(totalAvailable / 100).toFixed(2)}`);
  console.log(`  - Contas com saldo suficiente: ${sufficientBalance.length}`);
  console.log(`  - Contas sem saldo suficiente: ${insufficientBalance.length}`);
  
  return {
    sufficientBalance,
    insufficientBalance,
    totalRequired: requiredBalance,
    totalAvailable
  };
}

/**
 * Busca contas de apostas ativas filtradas por plataforma
 * @param platform - Plataforma específica (fssb, biahosted, etc.)
 * @returns Array de contas ativas da plataforma especificada
 */
async function getActiveAccounts(platform?: string): Promise<BetAccount[]> {
  try {
    // Inicializar conexão com o banco se necessário
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    
    // Construir filtro baseado na plataforma
    const whereCondition: { isActive: boolean; platform?: string } = {
      isActive: true
    };
    
    // Se plataforma foi especificada, filtrar por ela
    if (platform) {
      whereCondition.platform = platform.toLowerCase();
      console.log(`🔍 Buscando contas ativas da plataforma: ${platform}`);
    } else {
      console.log(`🔍 Buscando todas as contas ativas (sem filtro de plataforma)`);
    }
    
    // Buscar contas ativas com filtro
    const activeAccounts = await betAccountRepository.find({
      where: whereCondition,
      order: {
        balance: 'DESC', // Ordenar por maior saldo primeiro
        updatedAt: 'DESC'
      }
    });

    console.log(`🔍 Encontradas ${activeAccounts.length} contas ativas${platform ? ` da plataforma ${platform}` : ''}`);
    
    // Log detalhado das contas encontradas
    activeAccounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.site} (${account.platform}) - Saldo: R$ ${(account.balance / 100).toFixed(2)}`);
    });
    
    return activeAccounts;
    
  } catch (error) {
    console.error('❌ Erro ao buscar contas ativas:', error);
    throw new Error('Falha ao buscar contas de apostas ativas');
  }
}

/**
 * Processa uma aposta individual para uma conta Biahosted
 * @param account - Conta de aposta Biahosted
 * @param betData - Dados da aposta
 * @param stake - Valor da aposta
 * @returns Resultado da aposta
 */
async function processBetForAccountBia(account: BetAccount, betData: BetData, stake: number): Promise<BettingResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`🎯 Processando aposta Biahosted para ${account.site} (ID: ${account.id})`);
    
    // Criar instância da plataforma
    const platform = getPlatformInstance(account);
    
    // Credenciais de login
    const credentials: LoginCredentials = {
      email: account.email,
      password: account.password
    };
    
    // 1. Fazer login
    console.log(`🔐 Fazendo login em ${account.site}...`);
    const loginResult = await platform.login(credentials);

    // 2. Gerar token de usuário
    console.log(`🎫 Gerando token de usuário para ${account.site}...`);
    const userToken = await platform.generateToken(loginResult.access_token, loginResult.access_token);
    console.log(userToken);

    // 3. Fazer sign in na plataforma
    console.log(`🚪 Fazendo sign in na plataforma para ${account.site}...`);
    const platformToken = await platform.signIn(userToken.token);
    console.log(platformToken);
    
    // 4. Atualizar odds para cada integration
    const integration = account.site.toLowerCase() === 'mcgames' ? 'mcgames2' : account.site.toLowerCase();
    const oddsUpdated = await updateOddsInBetData(betData, integration);
    
    if (oddsUpdated) {
      console.log(`✅ Odds atualizadas com sucesso para ${account.site}`);
    } else {
      console.log(`ℹ️ Odds mantidas (sem mudanças significativas) para ${account.site}`);
    }
    
    // 5. Preparar payload da aposta
    const betPayload: BetData = {
      ...betData,
      culture: 'pt-BR',
      timezoneOffset: 180,
      integration: integration,
      deviceType: 1,
      numFormat: 'en-GB',
      countryCode: 'BR',
      requestId: generateRandomRequestId()
    };
    
    // 6. Fazer a aposta
    console.log(`🎲 Executando aposta de R$ ${stake.toFixed(2)} em ${account.site}...`);
    const betResult = await platform.placeBet(platformToken.accessToken, betPayload);
    
    // 7. Fazer novo login para verificar saldo
    console.log(`🔐 Fazendo novo login em ${account.site}...`);
    const loginResult2 = await platform.login(credentials);
    
    // 8. Verificar saldo após a aposta
    const newBalance = await platform.getBalance(loginResult2.access_token);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Aposta realizada com sucesso em ${account.site} em ${processingTime}ms`);
    console.log(`   - Bet ID: ${betResult.bets?.[0]?.id || 'N/A'}`);
    console.log(`   - Saldo anterior: R$ ${(account.balance / 100).toFixed(2)}`);
    console.log(`   - Saldo atual: R$ ${(newBalance / 100).toFixed(2)}`);
    
    return {
      accountId: account.id,
      site: account.site,
      platform: account.platform,
      success: true,
      betId: betResult.bets?.[0]?.id?.toString() || `BET_${Date.now()}`,
      stake: stake,
      balance: account.balance,
      newBalance: newBalance,
      processingTime: processingTime,
      timestamp: timestamp
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    console.error(`❌ Erro ao processar aposta Biahosted em ${account.site}:`, errorMessage);
    
    return {
      accountId: account.id,
      site: account.site,
      platform: account.platform,
      success: false,
      error: errorMessage,
      stake: stake,
      balance: account.balance,
      processingTime: processingTime,
      timestamp: timestamp
    };
  }
}

/**
 * Processa uma aposta individual para uma conta FSSB
 * @param account - Conta de aposta FSSB
 * @param fssbBetData - Dados da aposta FSSB
 * @param stake - Valor da aposta
 * @returns Resultado da aposta
 */
async function processBetForAccountFssb(account: BetAccount, fssbBetData: FssbBetData, stake: number): Promise<BettingResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {    
    // Criar instância da plataforma
    const platform = getPlatformInstance(account);
    
    // Credenciais de login
    const credentials: LoginCredentials = {
      email: account.email,
      password: account.password
    };
    
    // 1. Fazer login através do SiteAuthService
    console.log(`🔐 Fazendo login através do SiteAuthService em ${account.site}...`);
    
    // Importar SiteAuthService
    const { SiteAuthService } = await import('@/services/siteAuth');
    
    // Inicializar conexão com o banco se necessário
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    
    // Criar instância do SiteAuthService
    const siteAuth = new SiteAuthService(account.siteUrl, account, betAccountRepository, account.sessionCookies);
    
    // Fazer login
    const loginResult = await siteAuth.login(credentials);
    console.log(`✅ Login realizado com sucesso no SiteAuthService`);

    //Launcher Pegar URL da plataforma baseada no site
    const launchResponse = await siteAuth.launch(loginResult.access_token, account.site);

    //Fazer Registro na Plataforma e pegar Cookies
    await platform.signIn(launchResponse.url);

    const betslipResponse = await platform.getBetslip();
    
    // Log detalhado do betslip para debug
    console.log(`📋 Betslip obtido: ${betslipResponse.length} itens`);
    
    //Limpar Betslip se existir
    if (betslipResponse.length > 0) {
      console.log(`🧹 Limpando betslip existente...`);
      try {
        await platform.clearBetslip();
        console.log(`✅ Betslip limpo com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao limpar betslip:`, error);
        // Continuar mesmo com erro na limpeza
      }
    }

    //Criar Betslip com as seleções
    const selections = fssbBetData.selections;
    console.log(`📋 Criando betslip com ${selections.length} seleções:`, JSON.stringify(selections, null, 2));
    
    const betslip = await (platform as FssbPlatform).addToBetslip(selections);


    // Usar o método buildBetsRequest do FssbPlatform
    const betsRequest = (platform as FssbPlatform).buildBetsRequest(betslip, fssbBetData.stakes);
    console.log(JSON.stringify(betsRequest, null, 2));

    //Vamos fazer a bets agora. 
    const bets = await (platform as FssbPlatform).placeBets(betsRequest);
    console.log(bets);


    // Exemplo de como adicionar seleções ao betslip (comentado por enquanto)
    // const testSelections = [
    //   {
    //     selectionId: "0OU766498958343434276OMM",
    //     viewKey: 1,
    //     isCrossBet: false,
    //     isAddedToBetslip: false,
    //     isDynamicMarket: false,
    //     isBetBuilderBet: false
    //   }
    // ];
    // console.log(`➕ Adicionando seleções de teste ao betslip...`);
    // const addedSelections = await platform.addToBetslip(testSelections);
    // console.log(`✅ Seleções adicionadas: ${addedSelections.length} itens`);
    
    //console.log(betslipResponse);

    
    //const platformToken = { accessToken: fssbSignInResult.accessToken };
    //console.log(`✅ FSSB SignIn concluído - CustomerId: ${(fssbSignInResult as FssbPlatformToken).platformCustomerId || 'N/A'}`);
    
    // 4. Preparar payload específico para FSSB (comentado por enquanto)
    // const betPayload: BetData = {
    //   ...betData,
    //   culture: 'pt-BR',
    //   timezoneOffset: 180,
    //   integration: 'fssb',
    //   deviceType: 1,
    //   numFormat: 'en-GB',
    //   countryCode: 'BR',
    //   requestId: generateRandomRequestId()
    // };
    
    // 5. Fazer a aposta
    //console.log(`🎲 Executando aposta de R$ ${stake.toFixed(2)} em ${account.site}...`);
    //const betResult = await platform.placeBet(platformToken.accessToken, betPayload);
    
    // 6. Verificar saldo após a aposta usando SiteAuthService
    console.log(`💰 Verificando saldo após aposta em ${account.site}...`);
    //const newBalance = await siteAuth.getBalance(loginResult.access_token);
    
    const processingTime = Date.now() - startTime;

    
    return {
      accountId: account.id,
      site: account.site,
      platform: account.platform,
      success: true,
      betId: '', /*betResult.bets?.[0]?.id?.toString() || `BET_${Date.now()}`,*/
      stake: stake,
      balance: account.balance,
      newBalance: 0, /*newBalance,*/
      processingTime: processingTime,
      timestamp: timestamp
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    console.error(`❌ Erro ao processar aposta FSSB em ${account.site}:`, errorMessage);
    
    return {
      accountId: account.id,
      site: account.site,
      platform: account.platform,
      success: false,
      error: errorMessage,
      stake: stake,
      balance: account.balance,
      processingTime: processingTime,
      timestamp: timestamp
    };
  }
}

/**
 * Worker que processa todas as apostas simultaneamente
 * @param accounts - Contas com saldo suficiente
 * @param betData - Dados da aposta para Biahosted
 * @param fssbBetData - Dados da aposta para FSSB
 * @param stake - Valor da aposta por conta
 * @returns Resultado consolidado de todas as apostas
 */
async function processBettingWorker(accounts: BetAccount[], betData: BetData, fssbBetData: FssbBetData, stake: number): Promise<BettingWorkerResult> {
  const workerStartTime = Date.now();
  
  console.log(`🚀 Iniciando worker de apostas para ${accounts.length} contas`);
  console.log(`💰 Stake por conta: R$ ${stake.toFixed(2)}`);
  console.log(`🎯 Stake total: R$ ${(stake * accounts.length).toFixed(2)}`);
  
  // Processar todas as apostas simultaneamente usando Promise.all
  const bettingPromises = accounts.map(account => {
    // Escolher função baseada na plataforma
    if (account.platform.toLowerCase() === 'fssb') {
      return processBetForAccountFssb(account, fssbBetData, stake);
    } else {
      return processBetForAccountBia(account, betData, stake);
    }
  });
  
  console.log(`⚡ Executando ${bettingPromises.length} apostas em paralelo...`);
  
  // Aguardar todas as apostas terminarem
  const results = await Promise.all(bettingPromises);
  
  const totalProcessingTime = Date.now() - workerStartTime;
  
  // Calcular estatísticas
  const successfulBets = results.filter(result => result.success).length;
  const failedBets = results.filter(result => !result.success).length;
  const totalStake = stake * accounts.length; // Total investido por todas as contas
  const successRate = accounts.length > 0 ? (successfulBets / accounts.length) * 100 : 0;
  
  console.log(`\n📊 Resultado do Worker:`);
  console.log(`   - Total de contas: ${accounts.length}`);
  console.log(`   - Apostas bem-sucedidas: ${successfulBets}`);
  console.log(`   - Apostas falhadas: ${failedBets}`);
  console.log(`   - Taxa de sucesso: ${successRate.toFixed(2)}%`);
  console.log(`   - Stake total: R$ ${totalStake.toFixed(2)}`);
  console.log(`   - Tempo total: ${totalProcessingTime}ms`);
  
  // Log detalhado dos resultados
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.site} - ${result.processingTime}ms`);
    if (!result.success) {
      console.log(`      Erro: ${result.error}`);
    }
  });
  
  return {
    totalAccounts: accounts.length,
    successfulBets,
    failedBets,
    totalStake,
    totalProcessingTime,
    results,
    summary: {
      totalRequired: totalStake * 100, // Em centavos
      totalAvailable: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      totalProcessed: totalStake * 100,
      successRate
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando processamento de aposta...');
    const body: BettingPayload = await request.json();
    
    console.log('🎯 Recebido payload do frontend:', JSON.stringify(body, null, 2));
    
    // Detectar plataforma
    const platform = body.platform || 'biahosted'; // Default para biahosted
    const { data } = body;
    
    console.log(`🔧 Plataforma detectada: ${platform}`);
    
    // Processar dados baseado na plataforma
    let betMarkets: BettingEvent[] = [];
    let stakes: number[] = [];
    let fssbBetData: FssbBetData | null = null;
    
    if (platform === 'fssb') {
      // Para FSSB, usar dados diretamente do payload
      const { selections, stakes: fssbStakes } = data;
      stakes = fssbStakes;
      
      // Criar dados específicos para FSSB
      fssbBetData = {
        selections: selections || [],
        stakes: fssbStakes || []
      };
      
      console.log(`🎯 FSSB: ${selections?.length || 0} seleções processadas`);
    } else {
      // Para Biahosted, usar formato original
      betMarkets = data.betMarkets || [];
      stakes = data.stakes || [];
      
      console.log(`🎯 Biahosted: ${betMarkets.length} eventos processados`);
    }
    
    // Buscar contas ativas da plataforma específica
    const activeAccounts = await getActiveAccounts(platform);
    
    if (activeAccounts.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Nenhuma conta ativa encontrada para a plataforma ${platform}`,
        platform: platform,
        availableAccounts: 0
      }, { status: 400 });
    }

    //vamos agora pegar as contas de apostas que tem saldo suficiente para a aposta
    
    // Calcular o stake total necessário em centavos
    const totalStakeRequired = stakes.reduce((sum: number, stake: number) => sum + stake, 0);
    const totalStakeInCents = Math.round(totalStakeRequired * 100);
    
    console.log(`💵 Stake total necessário: R$ ${totalStakeRequired.toFixed(2)} (${totalStakeInCents} centavos)`);
    
    // Separar contas por saldo suficiente
    const balanceResult = separateAccountsByBalance(activeAccounts, totalStakeInCents);
    
    // HACK: Para teste - usar todas as contas mesmo sem saldo suficiente
    console.log('🔧 HACK ATIVO: Ignorando verificação de saldo para teste');
    const testAccounts = activeAccounts; // Usar todas as contas para teste
    
    // Verificar se há contas com saldo suficiente (comentado para teste)
    // if (balanceResult.sufficientBalance.length === 0) {
    //   console.log('❌ Nenhuma conta com saldo suficiente - retornando erro 400');
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Nenhuma conta com saldo suficiente encontrada',
    //     requiredBalance: totalStakeRequired,
    //     availableBalance: balanceResult.totalAvailable / 100,
    //     insufficientAccounts: balanceResult.insufficientBalance.map(account => ({
    //       id: account.id,
    //       site: account.site,
    //       balance: account.balance / 100,
    //       needed: (totalStakeInCents - account.balance) / 100
    //     }))
    //   }, { status: 400 });
    // }
    
    console.log(`🔧 TESTE: Usando ${testAccounts.length} contas da plataforma ${platform} para teste (ignorando saldo):`);
    testAccounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.site} (${account.platform}) - Saldo: R$ ${(account.balance / 100).toFixed(2)}`);
    });
    
    console.log(`✅ ${balanceResult.sufficientBalance.length} contas com saldo suficiente:`);
    balanceResult.sufficientBalance.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.site} - Saldo: R$ ${(account.balance / 100).toFixed(2)}`);
    });
    
    if (balanceResult.insufficientBalance.length > 0) {
      console.log(`⚠️ ${balanceResult.insufficientBalance.length} contas sem saldo suficiente:`);
      balanceResult.insufficientBalance.forEach((account, index) => {
        const needed = (totalStakeInCents - account.balance) / 100;
        console.log(`  ${index + 1}. ${account.site} - Saldo: R$ ${(account.balance / 100).toFixed(2)} (Falta: R$ ${needed.toFixed(2)})`);
      });
    }

    // Preparar dados da aposta para o worker
    let betData: BetData | null = null;
    
    if (platform !== 'fssb') {
      // Criar BetData apenas para Biahosted
      betData = {
        culture: 'pt-BR',
        timezoneOffset: 180,
        deviceType: 1,
        numFormat: 'en-GB',
        countryCode: 'BR',
        betType: 0, // 0 = simples, 1 = múltipla
        isAutoCharge: false,
        stakes: stakes,
        oddsChangeAction: 1,
        betMarkets: betMarkets.map(event => ({
          id: event.id,
          isBanker: event.isBanker,
          dbId: event.dbId,
          sportName: event.sportName,
          rC: event.rC,
          eventName: event.eventName,
          catName: event.catName,
          champName: event.champName,
          sportTypeId: event.sportTypeId,
          odds: event.odds.map(odd => ({
            id: odd.id,
            marketId: odd.marketId,
            price: odd.price,
            marketName: odd.marketName,
            marketTypeId: odd.marketTypeId,
            mostBalanced: odd.mostBalanced,
            selectionTypeId: odd.selectionTypeId,
            selectionName: odd.selectionName,
            widgetInfo: {
              widget: odd.widgetInfo.widget,
              page: odd.widgetInfo.page,
              tabIndex: odd.widgetInfo.tabIndex,
              tipsterId: odd.widgetInfo.tipsterId?.toString(),
              suggestionType: odd.widgetInfo.suggestionType?.toString()
            }
          }))
        })),
        eachWays: new Array(betMarkets.length).fill(false),
        requestId: generateRandomRequestId(),
        confirmedByClient: false,
        device: 0
      };
    }

    // Cada conta fará a mesma stake individual
    const stakePerAccount = totalStakeRequired; // Cada conta faz o stake total
    
    console.log(`🎲 Stake por conta: R$ ${stakePerAccount.toFixed(2)}`);
    
    // Executar o worker de apostas (usando contas de teste)
    console.log(`\n🚀 Iniciando processamento de apostas com HACK...`);
    const workerResult = await processBettingWorker(testAccounts, betData!, fssbBetData!, stakePerAccount);
    
    // Calcular odds total e ganho potencial
    let totalOdds = 1;
    let eventsCount = 0;
    let selectionsCount = 0;
    
    if (platform === 'fssb') {
      // Para FSSB, não temos odds disponíveis no payload atual
      totalOdds = 1; // Valor padrão
      eventsCount = fssbBetData!.selections.length;
      selectionsCount = fssbBetData!.selections.length;
    } else {
      // Para Biahosted, calcular odds normalmente
      totalOdds = betMarkets.reduce((total: number, event: BettingEvent) => {
        return total * event.odds.reduce((eventTotal: number, odd: BettingOdd) => eventTotal * odd.price, 1);
      }, 1);
      eventsCount = betMarkets.length;
      selectionsCount = betMarkets.reduce((total: number, event: BettingEvent) => total + event.odds.length, 0);
    }
    const potentialWin = workerResult.totalStake * totalOdds;
    
    console.log('\n💰 Resumo final da operação:');
    console.log(`- Stake total: R$ ${workerResult.totalStake.toFixed(2)}`);
    console.log(`- Odds total: ${totalOdds.toFixed(2)}`);
    console.log(`- Ganho potencial: R$ ${potentialWin.toFixed(2)}`);
    console.log(`- Taxa de sucesso: ${workerResult.summary.successRate.toFixed(2)}%`);
    console.log(`- Tempo total: ${workerResult.totalProcessingTime}ms`);
    
    // Preparar resposta consolidada
    const response = {
      success: workerResult.successfulBets > 0,
      message: workerResult.successfulBets > 0 
        ? `${workerResult.successfulBets} apostas processadas com sucesso (HACK ATIVO)` 
        : 'Nenhuma aposta foi processada com sucesso (HACK ATIVO)',
      workerResult: {
        totalAccounts: workerResult.totalAccounts,
        successfulBets: workerResult.successfulBets,
        failedBets: workerResult.failedBets,
        totalStake: workerResult.totalStake,
        totalProcessingTime: workerResult.totalProcessingTime,
        successRate: workerResult.summary.successRate
      },
      summary: {
        totalStake: workerResult.totalStake,
        totalOdds,
        potentialWin,
        betType: eventsCount === 1 ? 'simples' : 'multipla',
        eventsCount: eventsCount,
        selectionsCount: selectionsCount
      },
      accounts: {
        sufficientBalance: balanceResult.sufficientBalance.map(account => ({
          id: account.id,
          site: account.site,
          platform: account.platform,
          balance: account.balance / 100,
          siteUrl: account.siteUrl,
          userId: account.userId
        })),
        insufficientBalance: balanceResult.insufficientBalance.map(account => ({
          id: account.id,
          site: account.site,
          platform: account.platform,
          balance: account.balance / 100,
          needed: (totalStakeInCents - account.balance) / 100,
          siteUrl: account.siteUrl
        })),
        totalRequired: totalStakeRequired,
        totalAvailable: balanceResult.totalAvailable / 100
      },
      bettingResults: workerResult.results.map(result => ({
        accountId: result.accountId,
        site: result.site,
        platform: result.platform,
        success: result.success,
        betId: result.betId,
        error: result.error,
        stake: result.stake,
        balance: result.balance / 100, // Converter para reais
        newBalance: result.newBalance ? result.newBalance / 100 : undefined,
        processingTime: result.processingTime,
        timestamp: result.timestamp
      })),
      timestamp: new Date().toISOString()
    };
    
    //console.log('✅ Resposta enviada para o frontend:', response);
    console.log('🎯 Finalizando processamento com sucesso');
    
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
