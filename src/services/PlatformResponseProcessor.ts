import { BettingService } from './BettingService';
import { BettingErrorHandler } from './BettingErrorHandler';
import { 
  FSSBBetReturn, 
  BiahostedBetReturn, 
  BettingResult, 
  BettingError 
} from '@/types/bettingReturns';

export class PlatformResponseProcessor {
  private bettingService: BettingService;

  constructor() {
    this.bettingService = new BettingService();
  }

  /**
   * Processa resposta de sucesso da FSSB
   */
  async processFSSBSuccess(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    response: any
  ): Promise<BettingResult> {
    try {
      // Validar estrutura da resposta
      if (!this.isValidFSSBResponse(response)) {
        throw new Error('Resposta FSSB inválida');
      }

      const fssbResponse: FSSBBetReturn = response;

      return await this.bettingService.processFSSBReturn(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        fssbResponse
      );

    } catch (error) {
      console.error('Erro ao processar sucesso FSSB:', error);
      
      const bettingError = BettingErrorHandler.analyzeError(error, 'fssb');
      
      return await this.bettingService.processFSSBReturn(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        {} as FSSBBetReturn,
        bettingError
      );
    }
  }

  /**
   * Processa erro da FSSB
   */
  async processFSSBError(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    error: any
  ): Promise<BettingResult> {
    const bettingError = BettingErrorHandler.analyzeError(error, 'fssb');
    
    return await this.bettingService.processFSSBReturn(
      betBettingId,
      betAccountId,
      platform,
      site,
      balanceBefore,
      {} as FSSBBetReturn,
      bettingError
    );
  }

  /**
   * Processa resposta de sucesso da Biahosted
   */
  async processBiahostedSuccess(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    response: any
  ): Promise<BettingResult> {
    try {
      // Validar estrutura da resposta
      if (!this.isValidBiahostedResponse(response)) {
        throw new Error('Resposta Biahosted inválida');
      }

      const biahostedResponse: BiahostedBetReturn = response;

      return await this.bettingService.processBiahostedReturn(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        biahostedResponse
      );

    } catch (error) {
      console.error('Erro ao processar sucesso Biahosted:', error);
      
      const bettingError = BettingErrorHandler.analyzeError(error, 'biahosted');
      
      return await this.bettingService.processBiahostedReturn(
        betBettingId,
        betAccountId,
        platform,
        site,
        balanceBefore,
        {} as BiahostedBetReturn,
        bettingError
      );
    }
  }

  /**
   * Processa erro da Biahosted
   */
  async processBiahostedError(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    error: any
  ): Promise<BettingResult> {
    const bettingError = BettingErrorHandler.analyzeError(error, 'biahosted');
    
    return await this.bettingService.processBiahostedReturn(
      betBettingId,
      betAccountId,
      platform,
      site,
      balanceBefore,
      {} as BiahostedBetReturn,
      bettingError
    );
  }

  /**
   * Valida se a resposta FSSB tem a estrutura esperada
   */
  private isValidFSSBResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      response.SQLTicketID &&
      typeof response.potentialReturns === 'number' &&
      response.bets &&
      Array.isArray(response.bets) &&
      response.bets.length > 0 &&
      response.bets[0].stake &&
      response.bets[0].trueOdds
    );
  }

  /**
   * Valida se a resposta Biahosted tem a estrutura esperada
   */
  private isValidBiahostedResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      response.requestId &&
      response.stakes &&
      Array.isArray(response.stakes) &&
      response.stakes.length > 0 &&
      response.betMarkets &&
      Array.isArray(response.betMarkets) &&
      response.betMarkets.length > 0 &&
      response.betMarkets[0].odds &&
      Array.isArray(response.betMarkets[0].odds) &&
      response.betMarkets[0].odds.length > 0
    );
  }

  /**
   * Extrai informações importantes da resposta FSSB
   */
  extractFSSBInfo(response: FSSBBetReturn): {
    bilheteId: string;
    stake: number;
    odd: number;
    potentialWin: number;
    eventName: string;
    leagueName: string;
    sportName: string;
    selectionName: string;
    marketName: string;
  } {
    const bet = response.bets[0];
    const selection = bet.selections[0];

    return {
      bilheteId: response.SQLTicketID,
      stake: bet.stake,
      odd: bet.trueOdds,
      potentialWin: bet.potentialReturns,
      eventName: selection.event.EventName,
      leagueName: selection.event.LeagueName,
      sportName: selection.event.SportName,
      selectionName: selection.Name,
      marketName: selection.market.Name
    };
  }

  /**
   * Extrai informações importantes da resposta Biahosted
   */
  extractBiahostedInfo(response: BiahostedBetReturn): {
    bilheteId: string;
    stake: number;
    odd: number;
    potentialWin: number;
    eventName: string;
    leagueName: string;
    sportName: string;
    selectionName: string;
    marketName: string;
  } {
    const betMarket = response.betMarkets[0];
    const odd = betMarket.odds[0];

    return {
      bilheteId: response.requestId,
      stake: response.stakes[0],
      odd: odd.price,
      potentialWin: response.stakes[0] * odd.price,
      eventName: betMarket.eventName,
      leagueName: betMarket.champName,
      sportName: betMarket.sportName,
      selectionName: odd.selectionName,
      marketName: odd.marketName
    };
  }

  /**
   * Processa resposta genérica (tenta detectar a plataforma)
   */
  async processGenericResponse(
    betBettingId: string,
    betAccountId: string,
    platform: string,
    site: string,
    balanceBefore: number,
    response: any,
    isError: boolean = false
  ): Promise<BettingResult> {
    try {
      // Detectar tipo de resposta baseado na estrutura
      if (this.isValidFSSBResponse(response)) {
        if (isError) {
          return await this.processFSSBError(
            betBettingId, betAccountId, platform, site, balanceBefore, response
          );
        } else {
          return await this.processFSSBSuccess(
            betBettingId, betAccountId, platform, site, balanceBefore, response
          );
        }
      } else if (this.isValidBiahostedResponse(response)) {
        if (isError) {
          return await this.processBiahostedError(
            betBettingId, betAccountId, platform, site, balanceBefore, response
          );
        } else {
          return await this.processBiahostedSuccess(
            betBettingId, betAccountId, platform, site, balanceBefore, response
          );
        }
      } else {
        throw new Error('Formato de resposta não reconhecido');
      }
    } catch (error) {
      console.error('Erro ao processar resposta genérica:', error);
      
      const bettingError = BettingErrorHandler.analyzeError(error, platform);
      
      // Usar o serviço apropriado baseado na plataforma
      if (platform === 'fssb') {
        return await this.bettingService.processFSSBReturn(
          betBettingId, betAccountId, platform, site, balanceBefore,
          {} as FSSBBetReturn, bettingError
        );
      } else {
        return await this.bettingService.processBiahostedReturn(
          betBettingId, betAccountId, platform, site, balanceBefore,
          {} as BiahostedBetReturn, bettingError
        );
      }
    }
  }
}
