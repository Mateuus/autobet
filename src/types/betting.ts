// Tipos para o sistema de extrato de apostas
export interface BetBilhete {
  id: string;
  platform: string;        // 'biahosted', 'fssb'
  site: string;            // 'lotogreen', 'mcgames', etc.
  betAccountId: string;    // FK para BetAccount
  betBettingId: string;    // FK para BetBetting
  bilheteId?: string;      // ID do bilhete na casa de aposta
  stake: number;           // Valor apostado neste bilhete
  odd: number;             // Odd específica deste bilhete
  potentialWin?: number;    // Ganho potencial (stake * odd)
  actualWin?: number;      // Ganho real após resultado
  balanceBefore: number;   // Saldo antes da aposta
  balanceAfter?: number;   // Saldo após a aposta
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';
  betData?: any;          // Dados completos da aposta
  resultData?: any;       // Dados do resultado retornado pela casa
  errorMessage?: string;   // Mensagem de erro se houver
  createdAt: Date;
  updatedAt: Date;
}

export interface BetBetting {
  id: string;
  accountId: string;      // FK para Account (usuário do AutoBet)
  description?: string;    // Descrição da estratégia/aposta
  stakeTotal: number;     // Stake total investido em todas as contas
  averageOdd: number;     // Odd média de todos os bilhetes
  totalBilhetes: number;  // Quantidade total de bilhetes criados
  successfulBilhetes: number; // Bilhetes criados com sucesso
  failedBilhetes: number; // Bilhetes que falharam
  totalPotentialWin?: number; // Ganho potencial total
  totalActualWin?: number;   // Ganho real total
  profitLoss?: number;       // Lucro/Prejuízo final
  status: 'pending' | 'completed' | 'partial' | 'failed';
  betConfig?: any;         // Configuração da aposta
  summary?: any;           // Resumo dos resultados por plataforma
  createdAt: Date;
  updatedAt: Date;
  bilhetes?: BetBilhete[]; // Relacionamento 1:N
}

// Dados mock baseados no retorno real da FSSB
export const mockBetBilhetes: BetBilhete[] = [
  {
    id: '1',
    platform: 'fssb',
    site: 'fssb',
    betAccountId: 'acc-1',
    betBettingId: 'betting-1',
    bilheteId: '769821280337580032',
    stake: 0.65,
    odd: 1.77,
    potentialWin: 1.15,
    actualWin: undefined,
    balanceBefore: 10.50,
    balanceAfter: undefined,
    status: 'pending',
    betData: {
      SQLTicketID: '769821280337580032',
      potentialReturns: 1.15,
      status: 'Open',
      type: 'single',
      bets: [{
        stake: 0.65,
        trueOdds: 1.77,
        clientOdds: '1.77',
        selections: [{
          Name: 'Atlético MG',
          BetslipLine: 'Atlético MG vs Ceará',
          TypeName: '1X2',
          TrueOdds: 1.77,
          event: {
            EventName: 'Atlético MG vs Ceará',
            LeagueName: 'Brasileirão Série A',
            SportName: 'Futebol',
            StartEventDate: '2025-10-25T19:00:00.000Z'
          }
        }]
      }]
    },
    createdAt: new Date('2025-01-15T10:30:00'),
    updatedAt: new Date('2025-01-15T10:30:00')
  },
  {
    id: '2',
    platform: 'biahosted',
    site: 'lotogreen',
    betAccountId: 'acc-2',
    betBettingId: 'betting-1',
    bilheteId: 'LG123456789',
    stake: 0.65,
    odd: 1.80,
    potentialWin: 1.17,
    actualWin: undefined,
    balanceBefore: 25.30,
    balanceAfter: undefined,
    status: 'pending',
    betData: {
      ticketId: 'LG123456789',
      stake: 0.65,
      odds: 1.80,
      potentialWin: 1.17,
      selections: [{
        event: 'Flamengo vs Palmeiras',
        market: 'Resultado Final 1x2',
        selection: 'Flamengo',
        odds: 1.80
      }]
    },
    createdAt: new Date('2025-01-15T10:30:00'),
    updatedAt: new Date('2025-01-15T10:30:00')
  },
  {
    id: '3',
    platform: 'biahosted',
    site: 'mcgames',
    betAccountId: 'acc-3',
    betBettingId: 'betting-1',
    bilheteId: 'MC987654321',
    stake: 0.65,
    odd: 1.75,
    potentialWin: 1.14,
    actualWin: 1.14,
    balanceBefore: 15.20,
    balanceAfter: 15.85,
    status: 'won',
    betData: {
      ticketId: 'MC987654321',
      stake: 0.65,
      odds: 1.75,
      potentialWin: 1.14,
      selections: [{
        event: 'São Paulo vs Corinthians',
        market: 'Resultado Final 1x2',
        selection: 'São Paulo',
        odds: 1.75
      }]
    },
    resultData: {
      status: 'won',
      actualWin: 1.14,
      settledAt: '2025-01-15T22:00:00'
    },
    createdAt: new Date('2025-01-15T09:15:00'),
    updatedAt: new Date('2025-01-15T22:00:00')
  }
];

export const mockBetBettings: BetBetting[] = [
  {
    id: 'betting-1',
    accountId: 'user-1',
    description: 'Estratégia Brasileirão - Jogos da tarde',
    stakeTotal: 1.95, // 0.65 * 3 contas
    averageOdd: 1.77, // (1.77 + 1.80 + 1.75) / 3
    totalBilhetes: 3,
    successfulBilhetes: 3,
    failedBilhetes: 0,
    totalPotentialWin: 3.46, // 1.15 + 1.17 + 1.14
    totalActualWin: 1.14, // Apenas 1 bilhete foi resolvido
    profitLoss: -0.51, // 1.14 - 1.95 (considerando apenas o resolvido)
    status: 'partial',
    betConfig: {
      strategy: 'brasileirao-tarde',
      markets: ['1x2'],
      minOdds: 1.50,
      maxOdds: 2.00
    },
    summary: {
      fssb: { total: 1, successful: 1, pending: 1 },
      biahosted: { total: 2, successful: 1, pending: 1 }
    },
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-15T22:00:00'),
    bilhetes: mockBetBilhetes
  },
  {
    id: 'betting-2',
    accountId: 'user-1',
    description: 'Estratégia Copa do Brasil - Final',
    stakeTotal: 2.00,
    averageOdd: 2.15,
    totalBilhetes: 2,
    successfulBilhetes: 2,
    failedBilhetes: 0,
    totalPotentialWin: 4.30,
    totalActualWin: 0,
    profitLoss: -2.00,
    status: 'pending',
    betConfig: {
      strategy: 'copa-brasil-final',
      markets: ['1x2', 'over/under'],
      minOdds: 2.00,
      maxOdds: 3.00
    },
    summary: {
      biahosted: { total: 2, successful: 2, pending: 2 }
    },
    createdAt: new Date('2025-01-14T20:00:00'),
    updatedAt: new Date('2025-01-14T20:00:00')
  }
];

// Estatísticas mock para o dashboard
export const mockStats = {
  totalApostadoHoje: 3.95,
  totalApostadoSemana: 15.80,
  totalApostadoMes: 67.50,
  lucroPrejuizoHoje: -0.51,
  lucroPrejuizoSemana: 2.30,
  lucroPrejuizoMes: -5.20,
  taxaSucessoHoje: 33.33, // 1 de 3 bilhetes resolvidos
  taxaSucessoSemana: 65.50,
  taxaSucessoMes: 58.75,
  bilhetesAtivos: 4,
  bilhetesPendentes: 3,
  bilhetesGanhos: 1,
  bilhetesPerdidos: 0
};
