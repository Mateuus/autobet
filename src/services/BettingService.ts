import { AppDataSource } from '@/database/data-source';
import { BetBilhete } from '@/entities/BetBilhete';
import { BetBetting } from '@/entities/BetBetting';
import { 
  FSSBBetReturn, 
  BiahostedBetReturn, 
  BettingResult, 
  BettingError,
  CreateBetBettingData,
  CreateBetBilheteData
} from '@/types/bettingReturns';

export class BettingService {
  private betBilheteRepository = AppDataSource.getRepository(BetBilhete);
  private betBettingRepository = AppDataSource.getRepository(BetBetting);

  /**
   * Cria um novo registro de BetBetting
   */
  async createBetBetting(data: CreateBetBettingData): Promise<BetBetting> {
    const stakeTotal = data.stakePerAccount * data.totalAccounts;
    
    const betBetting = this.betBettingRepository.create({
      accountId: data.accountId,
      description: data.description,
      stakeTotal,
      averageOdd: 0, // Será calculado após criar os bilhetes
      totalBilhetes: data.totalAccounts,
      successfulBilhetes: 0,
      failedBilhetes: 0,
      status: 'pending',
      betConfig: data.betConfig,
      summary: {
        totalAccounts: data.totalAccounts,
        stakePerAccount: data.stakePerAccount,
        stakeTotal
      }
    });

    return await this.betBettingRepository.save(betBetting);
  }

  /**
   * Processa retorno de aposta FSSB e cria BetBilhete
   */
  async processFSSBReturn(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    fssbResponse: FSSBBetReturn,
    error?: BettingError
  ): Promise<BettingResult> {
    try {
      if (error) {
        return await this.handleBettingError(
          betBettingId,
          betAccountId,
          platform,
          site,
          balanceBefore,
          error
        );
      }

      // Extrair dados da resposta FSSB
      const bet = fssbResponse.bets[0];
      const selection = bet.selections[0];
      
      const stake = bet.stake;
      const odd = bet.trueOdds;
      const potentialWin = bet.potentialReturns;
      const bilheteId = fssbResponse.SQLTicketID;

      // Criar BetBilhete
      await this.createBetBilhete({
        platform,
        site,
        betAccountId,
        betBettingId,
        stake,
        balanceBefore,
        betData: {
          fssbResponse,
          eventName: selection.event.EventName,
          leagueName: selection.event.LeagueName,
          sportName: selection.event.SportName,
          selectionName: selection.Name,
          marketName: selection.market.Name,
          betType: fssbResponse.type
        },
        resultData: {
          bilheteId,
          status: fssbResponse.status,
          potentialReturns: fssbResponse.potentialReturns
        }
      });

      // Atualizar BetBetting
      await this.updateBetBettingStats(betBettingId, true);

      return {
        success: true,
        bilheteId,
        stake,
        odd,
        potentialWin,
        balanceBefore,
        balanceAfter: balanceBefore - stake, // Assumindo que o saldo diminuiu
        rawResponse: fssbResponse
      };

    } catch (err) {
      console.error('Erro ao processar retorno FSSB:', err);
      return await this.handleBettingError(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        {
          type: 'UNKNOWN_ERROR',
          code: 'FSSB_PROCESSING_ERROR',
          message: 'Erro ao processar retorno da FSSB',
          details: err
        }
      );
    }
  }

  /**
   * Processa retorno de aposta Biahosted e cria BetBilhete
   */
  async processBiahostedReturn(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    biahostedResponse: BiahostedBetReturn,
    error?: BettingError
  ): Promise<BettingResult> {
    try {
      if (error) {
        return await this.handleBettingError(
          betBettingId,
          betAccountId,
          platform,
          site,
          balanceBefore,
          error
        );
      }

      // Extrair dados da resposta Biahosted
      const betMarket = biahostedResponse.betMarkets[0];
      const odd = biahostedResponse.betMarkets[0].odds[0];
      const stake = biahostedResponse.stakes[0];
      
      const potentialWin = stake * odd.price;
      const bilheteId = biahostedResponse.requestId;

      // Criar BetBilhete
      await this.createBetBilhete({
        platform,
        site,
        betAccountId,
        betBettingId,
        stake,
        balanceBefore,
        betData: {
          biahostedResponse,
          eventName: betMarket.eventName,
          leagueName: betMarket.champName,
          sportName: betMarket.sportName,
          selectionName: odd.selectionName,
          marketName: odd.marketName,
          betType: 'single' // Biahosted sempre retorna single
        },
        resultData: {
          bilheteId,
          status: 'Open', // Biahosted não retorna status específico
          potentialReturns: potentialWin
        }
      });

      // Atualizar BetBetting
      await this.updateBetBettingStats(betBettingId, true);

      return {
        success: true,
        bilheteId,
        stake,
        odd: odd.price,
        potentialWin,
        balanceBefore,
        balanceAfter: balanceBefore - stake, // Assumindo que o saldo diminuiu
        rawResponse: biahostedResponse
      };

    } catch (err) {
      console.error('Erro ao processar retorno Biahosted:', err);
      return await this.handleBettingError(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        {
          type: 'UNKNOWN_ERROR',
          code: 'BIAHOSTED_PROCESSING_ERROR',
          message: 'Erro ao processar retorno da Biahosted',
          details: err
        }
      );
    }
  }

  /**
   * Cria um BetBilhete no banco de dados
   */
  private async createBetBilhete(data: CreateBetBilheteData): Promise<BetBilhete> {
    // Extrair odd dos dados
    let odd = 0;
    if (data.resultData) {
      const r = data.resultData as Record<string, unknown>;
      const trueOdds = typeof r.trueOdds === 'number' ? r.trueOdds : undefined;
      const price = typeof r.price === 'number' ? r.price : undefined;
      const oddValue = typeof r.odd === 'number' ? r.odd : undefined;
      odd = trueOdds || price || oddValue || 0;
    }

    const betBilhete = this.betBilheteRepository.create({
      platform: data.platform,
      site: data.site,
      betAccountId: data.betAccountId,
      betBettingId: data.betBettingId,
      bilheteId: data.resultData?.bilheteId,
      stake: data.stake,
      odd: odd,
      potentialWin: data.resultData?.potentialReturns,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceBefore - data.stake, // Assumindo redução do saldo
      status: 'pending',
      betData: data.betData,
      resultData: data.resultData,
      errorMessage: data.errorMessage
    });

    return await this.betBilheteRepository.save(betBilhete);
  }

  /**
   * Trata erros de apostas e cria BetBilhete com erro
   */
  private async handleBettingError(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    error: BettingError
  ): Promise<BettingResult> {
    try {
      // Criar BetBilhete com erro
      await this.createBetBilhete({
        platform,
        site,
        betAccountId,
        betBettingId,
        stake: 0,
        balanceBefore,
        betData: null,
        errorMessage: `${error.type}: ${error.message}`
      });

      // Atualizar BetBetting
      await this.updateBetBettingStats(betBettingId, false);

      return {
        success: false,
        stake: 0,
        odd: 0,
        potentialWin: 0,
        balanceBefore,
        error,
        rawResponse: null
      };

    } catch (err) {
      console.error('Erro ao salvar erro de aposta:', err);
      return {
        success: false,
        stake: 0,
        odd: 0,
        potentialWin: 0,
        balanceBefore,
        error: {
          type: 'UNKNOWN_ERROR',
          code: 'DATABASE_ERROR',
          message: 'Erro ao salvar erro no banco de dados',
          details: err
        }
      };
    }
  }

  /**
   * Atualiza estatísticas do BetBetting
   */
  private async updateBetBettingStats(betBettingId: string, success: boolean): Promise<void> {
    const betBetting = await this.betBettingRepository.findOne({
      where: { id: betBettingId }
    });

    if (!betBetting) {
      throw new Error(`BetBetting ${betBettingId} não encontrado`);
    }

    if (success) {
      betBetting.successfulBilhetes += 1;
    } else {
      betBetting.failedBilhetes += 1;
    }

    // Calcular odd média dos bilhetes bem-sucedidos
    const successfulBilhetes = await this.betBilheteRepository.find({
      where: { 
        betBettingId,
        status: 'pending' // Bilhetes criados com sucesso
      }
    });

    if (successfulBilhetes.length > 0) {
      const totalOdds = successfulBilhetes.reduce((sum, bilhete) => sum + bilhete.odd, 0);
      betBetting.averageOdd = totalOdds / successfulBilhetes.length;
    }

    // Calcular ganho potencial total
    const totalPotentialWin = successfulBilhetes.reduce((sum, bilhete) => 
      sum + (bilhete.potentialWin || 0), 0
    );
    betBetting.totalPotentialWin = totalPotentialWin;

    // Atualizar status baseado no progresso
    if (betBetting.successfulBilhetes + betBetting.failedBilhetes === betBetting.totalBilhetes) {
      if (betBetting.failedBilhetes === 0) {
        betBetting.status = 'completed';
      } else if (betBetting.successfulBilhetes === 0) {
        betBetting.status = 'failed';
      } else {
        betBetting.status = 'partial';
      }
    }

    await this.betBettingRepository.save(betBetting);
  }

  /**
   * Busca BetBetting por ID
   */
  async getBetBettingById(id: string): Promise<BetBetting | null> {
    return await this.betBettingRepository.findOne({
      where: { id }
    });
  }

  /**
   * Busca BetBilhetes por BetBetting ID
   */
  async getBetBilhetesByBetBettingId(betBettingId: string): Promise<BetBilhete[]> {
    return await this.betBilheteRepository.find({
      where: { betBettingId },
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Busca extrato de apostas por conta
   */
  async getBettingExtract(accountId: string, filters?: {
    period?: 'today' | 'week' | 'month' | 'all';
    status?: 'pending' | 'completed' | 'partial' | 'failed';
    platform?: string;
  }): Promise<BetBetting[]> {
    let query = this.betBettingRepository
      .createQueryBuilder('betBetting')
      .where('betBetting.accountId = :accountId', { accountId });

    if (filters?.period && filters.period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      query = query.andWhere('betBetting.createdAt >= :startDate', { startDate });
    }

    if (filters?.status) {
      query = query.andWhere('betBetting.status = :status', { status: filters.status });
    }

    return await query
      .orderBy('betBetting.createdAt', 'DESC')
      .getMany();
  }
}
