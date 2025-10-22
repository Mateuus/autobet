import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { BiahostedPlatform } from '@/lib/platforms/BiahostedPlatform';
import { BetData, LoginCredentials } from '@/types';

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
 * Busca todas as contas de apostas ativas
 * @returns Array de todas as contas ativas
 */
async function getActiveAccounts(): Promise<BetAccount[]> {
  try {
    // Inicializar conexão com o banco se necessário
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    
    // Buscar todas as contas ativas
    const activeAccounts = await betAccountRepository.find({
      where: {
        isActive: true
      },
      order: {
        balance: 'DESC', // Ordenar por maior saldo primeiro
        updatedAt: 'DESC'
      }
    });

    console.log(`🔍 Encontradas ${activeAccounts.length} contas ativas`);
    
    return activeAccounts;
    
  } catch (error) {
    console.error('❌ Erro ao buscar contas ativas:', error);
    throw new Error('Falha ao buscar contas de apostas ativas');
  }
}

/**
 * Processa uma aposta individual para uma conta específica
 * @param account - Conta de aposta
 * @param betData - Dados da aposta
 * @param stake - Valor da aposta
 * @returns Resultado da aposta
 */
async function processBetForAccount(account: BetAccount, betData: BetData, stake: number): Promise<BettingResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`🎯 Processando aposta para ${account.site} (ID: ${account.id})`);
    
    // Criar instância da plataforma
    const platform = new BiahostedPlatform(account.site, account.siteUrl);
    
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

    console.log(platformToken); //platformToken.accessToken
    
    // 5. Preparar dados da aposta
    const stakeInCents = Math.round(stake * 100);
    
    // Verificar se é mcgames para usar integration correto
    const integration = account.site.toLowerCase() === 'mcgames' ? 'mcgames2' : platform.getSiteInfo().integration;
    
    const betPayload: BetData = {
      ...betData,
      stakes: [stakeInCents],
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
    
    // 7. Precisamos fazer um novo login para verificar o saldo após a aposta
    console.log(`🔐 Fazendo novo login em ${account.site}...`);
    const loginResult2 = await platform.login(credentials);
    
    // 8. Verificar saldo após a aposta
    const newBalance = await platform.getBalance(loginResult2.access_token);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Aposta realizada com sucesso em ${account.site} em ${processingTime}ms`);
    console.log(`   - Bet ID: ${betResult.bets?.[0]?.id || 'N/A'}`);
    console.log(`   - Saldo anterior: R$ ${(0 / 100).toFixed(2)}`);
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
    
    console.error(`❌ Erro ao processar aposta em ${account.site}:`, errorMessage);
    
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
 * @param betData - Dados da aposta
 * @param stake - Valor da aposta por conta
 * @returns Resultado consolidado de todas as apostas
 */
async function processBettingWorker(accounts: BetAccount[], betData: BetData, stake: number): Promise<BettingWorkerResult> {
  const workerStartTime = Date.now();
  
  console.log(`🚀 Iniciando worker de apostas para ${accounts.length} contas`);
  console.log(`💰 Stake por conta: R$ ${stake.toFixed(2)}`);
  console.log(`🎯 Stake total: R$ ${(stake * accounts.length).toFixed(2)}`);
  
  // Processar todas as apostas simultaneamente usando Promise.all
  const bettingPromises = accounts.map(account => 
    processBetForAccount(account, betData, stake)
  );
  
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
    
    //console.log('🎯 Recebido payload do frontend:', JSON.stringify(body, null, 2));
    
    // Aqui você pode processar os dados conforme necessário
    const { data } = body;
    const { betMarkets, stakes } = data;
    
    // Buscar todas as contas ativas
    const activeAccounts = await getActiveAccounts();
    
    if (activeAccounts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma conta ativa encontrada',
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
    
    console.log(`🔧 TESTE: Usando ${testAccounts.length} contas para teste (ignorando saldo):`);
    testAccounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.site} - Saldo: R$ ${(account.balance / 100).toFixed(2)}`);
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
    const betData: BetData = {
      culture: 'pt-BR',
      timezoneOffset: 180,
      deviceType: 1,
      numFormat: 'en-GB',
      countryCode: 'BR',
      //betType: (betMarkets.length === 1 && stakes.length === 1) || (betMarkets.length > 1 && stakes.length > 1) ? 1 : 2, // 1 = simples, 2 = múltipla
      betType: 0, // 0 = simples, 1 = múltipla
      isAutoCharge: false,
      stakes: stakes.map(stake => Math.round(stake * 100)), // Converter para centavos
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

    // Cada conta fará a mesma stake individual
    const stakePerAccount = totalStakeRequired; // Cada conta faz o stake total
    
    console.log(`🎲 Stake por conta: R$ ${stakePerAccount.toFixed(2)}`);
    
    // Executar o worker de apostas (usando contas de teste)
    console.log(`\n🚀 Iniciando processamento de apostas com HACK...`);
    const workerResult = await processBettingWorker(testAccounts, betData, stakePerAccount);
    
    // Calcular odds total e ganho potencial
    const totalOdds = betMarkets.reduce((total: number, event: BettingEvent) => {
      return total * event.odds.reduce((eventTotal: number, odd: BettingOdd) => eventTotal * odd.price, 1);
    }, 1);
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
        betType: betMarkets.length === 1 ? 'simples' : 'multipla',
        eventsCount: betMarkets.length,
        selectionsCount: betMarkets.reduce((total: number, event: BettingEvent) => total + event.odds.length, 0)
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
    
    console.log('✅ Resposta enviada para o frontend:', response);
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
