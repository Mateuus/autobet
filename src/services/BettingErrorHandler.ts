import { BettingError } from '@/types/bettingReturns';

export class BettingErrorHandler {
  /**
   * Analisa resposta de erro e categoriza o tipo
   */
  static analyzeError(error: any, platform: string): BettingError {
    const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
    const errorCode = error?.code || 'UNKNOWN';

    // Erros de autenticação
    if (this.isAuthenticationError(errorMessage, errorCode)) {
      return {
        type: 'AUTHENTICATION',
        code: errorCode,
        message: 'Erro de autenticação na casa de aposta',
        details: { platform, originalError: error }
      };
    }

    // Erros de saldo insuficiente
    if (this.isBalanceError(errorMessage, errorCode)) {
      return {
        type: 'BALANCE_INSUFFICIENT',
        code: errorCode,
        message: 'Saldo insuficiente para realizar a aposta',
        details: { platform, originalError: error }
      };
    }

    // Erros de odds alteradas
    if (this.isOddsChangedError(errorMessage, errorCode)) {
      return {
        type: 'ODDS_CHANGED',
        code: errorCode,
        message: 'Odds foram alteradas durante o processo de aposta',
        details: { platform, originalError: error }
      };
    }

    // Erros de mercado suspenso
    if (this.isMarketSuspendedError(errorMessage, errorCode)) {
      return {
        type: 'MARKET_SUSPENDED',
        code: errorCode,
        message: 'Mercado foi suspenso durante o processo de aposta',
        details: { platform, originalError: error }
      };
    }

    // Erros de rede
    if (this.isNetworkError(errorMessage, errorCode)) {
      return {
        type: 'NETWORK_ERROR',
        code: errorCode,
        message: 'Erro de conexão com a casa de aposta',
        details: { platform, originalError: error }
      };
    }

    // Erro desconhecido
    return {
      type: 'UNKNOWN_ERROR',
      code: errorCode,
      message: errorMessage,
      details: { platform, originalError: error }
    };
  }

  /**
   * Verifica se é erro de autenticação
   */
  private static isAuthenticationError(message: string, code: string): boolean {
    const authKeywords = [
      'unauthorized',
      'authentication',
      'login',
      'session',
      'token',
      'expired',
      'invalid credentials',
      'credenciais inválidas',
      'sessão expirada',
      'não autorizado'
    ];

    const authCodes = [
      '401',
      'UNAUTHORIZED',
      'AUTH_FAILED',
      'SESSION_EXPIRED',
      'INVALID_TOKEN'
    ];

    return authKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || authCodes.some(authCode => 
      code.toUpperCase().includes(authCode)
    );
  }

  /**
   * Verifica se é erro de saldo insuficiente
   */
  private static isBalanceError(message: string, code: string): boolean {
    const balanceKeywords = [
      'insufficient',
      'balance',
      'funds',
      'saldo insuficiente',
      'fundos insuficientes',
      'sem saldo',
      'valor insuficiente'
    ];

    const balanceCodes = [
      'INSUFFICIENT_FUNDS',
      'BALANCE_ERROR',
      'FUNDS_ERROR'
    ];

    return balanceKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || balanceCodes.some(balanceCode => 
      code.toUpperCase().includes(balanceCode)
    );
  }

  /**
   * Verifica se é erro de odds alteradas
   */
  private static isOddsChangedError(message: string, code: string): boolean {
    const oddsKeywords = [
      'odds changed',
      'price changed',
      'odds alteradas',
      'preço alterado',
      'cotação alterada',
      'odd mudou'
    ];

    const oddsCodes = [
      'ODDS_CHANGED',
      'PRICE_CHANGED',
      'QUOTE_CHANGED'
    ];

    return oddsKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || oddsCodes.some(oddsCode => 
      code.toUpperCase().includes(oddsCode)
    );
  }

  /**
   * Verifica se é erro de mercado suspenso
   */
  private static isMarketSuspendedError(message: string, code: string): boolean {
    const marketKeywords = [
      'market suspended',
      'mercado suspenso',
      'market closed',
      'mercado fechado',
      'suspended',
      'suspenso'
    ];

    const marketCodes = [
      'MARKET_SUSPENDED',
      'MARKET_CLOSED',
      'SUSPENDED'
    ];

    return marketKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || marketCodes.some(marketCode => 
      code.toUpperCase().includes(marketCode)
    );
  }

  /**
   * Verifica se é erro de rede
   */
  private static isNetworkError(message: string, code: string): boolean {
    const networkKeywords = [
      'network',
      'connection',
      'timeout',
      'network error',
      'connection error',
      'timeout error',
      'erro de rede',
      'erro de conexão',
      'tempo esgotado'
    ];

    const networkCodes = [
      'NETWORK_ERROR',
      'CONNECTION_ERROR',
      'TIMEOUT',
      'ECONNREFUSED',
      'ENOTFOUND'
    ];

    return networkKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || networkCodes.some(networkCode => 
      code.toUpperCase().includes(networkCode)
    );
  }

  /**
   * Gera mensagem amigável para o usuário
   */
  static getUserFriendlyMessage(error: BettingError): string {
    switch (error.type) {
      case 'AUTHENTICATION':
        return 'Erro de login na casa de aposta. Verifique suas credenciais.';
      
      case 'BALANCE_INSUFFICIENT':
        return 'Saldo insuficiente para realizar a aposta.';
      
      case 'ODDS_CHANGED':
        return 'As odds foram alteradas. Tente novamente.';
      
      case 'MARKET_SUSPENDED':
        return 'O mercado foi suspenso temporariamente.';
      
      case 'NETWORK_ERROR':
        return 'Erro de conexão. Verifique sua internet.';
      
      case 'UNKNOWN_ERROR':
      default:
        return 'Erro inesperado. Tente novamente mais tarde.';
    }
  }

  /**
   * Verifica se o erro é recuperável
   */
  static isRecoverableError(error: BettingError): boolean {
    switch (error.type) {
      case 'ODDS_CHANGED':
      case 'NETWORK_ERROR':
        return true;
      
      case 'AUTHENTICATION':
      case 'BALANCE_INSUFFICIENT':
      case 'MARKET_SUSPENDED':
      case 'UNKNOWN_ERROR':
      default:
        return false;
    }
  }

  /**
   * Sugere ação para o usuário baseada no erro
   */
  static getSuggestedAction(error: BettingError): string {
    switch (error.type) {
      case 'AUTHENTICATION':
        return 'Faça login novamente na casa de aposta';
      
      case 'BALANCE_INSUFFICIENT':
        return 'Deposite mais dinheiro na conta';
      
      case 'ODDS_CHANGED':
        return 'Tente fazer a aposta novamente';
      
      case 'MARKET_SUSPENDED':
        return 'Aguarde o mercado ser reaberto';
      
      case 'NETWORK_ERROR':
        return 'Verifique sua conexão com a internet';
      
      case 'UNKNOWN_ERROR':
      default:
        return 'Entre em contato com o suporte';
    }
  }
}
