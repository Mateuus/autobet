/**
 * Configurações para mercados especiais
 * 
 * Aqui você pode configurar comportamentos específicos para diferentes tipos de mercados
 * 
 * OPÇÕES DE CONFIGURAÇÃO:
 * 
 * 1. removeDuplicatesForAllMarkets: boolean
 *    - true: Processa duplicatas de TODOS os mercados (maior índice sobrescreve menor)
 *    - false: Processa duplicatas apenas dos sportMarketIds específicos (padrão)
 * 
 * 2. duplicateRemovalSportMarketIds: number[]
 *    - Array com IDs de mercados que devem ter processamento de duplicatas
 *    - Usado apenas quando removeDuplicatesForAllMarkets = false
 * 
 * COMO FUNCIONA:
 * Quando há mercados duplicados com mesmo ID:
 * - Mercado índice 1: {id: 123, shortName: "Vencedor do encontro", ...}
 * - Mercado índice 50: {id: 123, shortName: "Vencedor do encontro", ...}
 * 
 * O mercado de índice 50 (maior) OCUPA A POSIÇÃO do de índice 1 (menor)
 * Mantém a ordem original dos índices
 * 
 * EXEMPLOS DE USO:
 * 
 * Para processamento global:
 * removeDuplicatesForAllMarkets: true
 * 
 * Para processamento específico (padrão):
 * removeDuplicatesForAllMarkets: false
 * duplicateRemovalSportMarketIds: [70472, 12345]
 */

export interface MarketSpecialConfig {
  /** Se true, processa duplicatas de TODOS os mercados (maior índice sobrescreve menor). Se false, apenas dos sportMarketIds específicos */
  removeDuplicatesForAllMarkets: boolean;
  
  /** IDs de sportMarket que devem ter processamento de duplicatas (quando removeDuplicatesForAllMarkets = false) */
  duplicateRemovalSportMarketIds: number[];
  
  /** Outras configurações futuras podem ser adicionadas aqui */
  // exemplo: specialHandlingSportMarketIds: number[];
}

export const MARKET_CONFIG: MarketSpecialConfig = {
  // Ativar processamento de duplicatas para TODOS os mercados (padrão: false)
  removeDuplicatesForAllMarkets: false,
  
  // Configurar aqui os sportMarketIds que devem ter processamento de duplicatas
  // (usado apenas quando removeDuplicatesForAllMarkets = false)
  duplicateRemovalSportMarketIds: [
    70472, // Vencedor do encontro - exemplo
    70491 // Primeiro Gol
  ]
};

/**
 * Verifica se um mercado deve ter processamento de duplicatas baseado na configuração
 */
export function shouldRemoveDuplicates(sportMarketId: number): boolean {
  // Se a opção global estiver ativada, processar duplicatas de TODOS os mercados
  if (MARKET_CONFIG.removeDuplicatesForAllMarkets) {
    return true;
  }
  
  // Caso contrário, apenas dos sportMarketIds específicos
  return MARKET_CONFIG.duplicateRemovalSportMarketIds.includes(sportMarketId);
}
