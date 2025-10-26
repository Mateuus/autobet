# 🎯 Sistema de Extrato de Apostas - Guia de Implementação

## 📋 Visão Geral

Este sistema foi criado para tratar os retornos das apostas das plataformas **FSSB** e **Biahosted**, salvando todas as informações no banco de dados para análise e controle.

## 🗄️ Estrutura do Banco de Dados

### Entidades Criadas

#### 1. **BetBilhete** - Bilhetes Individuais
```typescript
// Armazena cada bilhete criado em cada casa de aposta
- id: string (UUID)
- platform: string ('fssb' | 'biahosted')
- site: string ('lotogreen', 'mcgames', etc.)
- betAccountId: string (FK para BetAccount)
- betBettingId: string (FK para BetBetting)
- bilheteId: string (ID do bilhete na casa)
- stake: number (valor apostado)
- odd: number (odd específica)
- potentialWin: number (ganho potencial)
- actualWin: number (ganho real)
- balanceBefore: number (saldo antes)
- balanceAfter: number (saldo depois)
- status: enum ('pending' | 'won' | 'lost' | 'cancelled' | 'refunded')
- betData: json (dados completos da aposta)
- resultData: json (dados do resultado)
- errorMessage: string (mensagem de erro)
```

#### 2. **BetBetting** - Controle de Apostas
```typescript
// Controla uma rodada completa de apostas
- id: string (UUID)
- accountId: string (FK para Account)
- description: string (descrição da estratégia)
- stakeTotal: number (stake total investido)
- averageOdd: number (odd média)
- totalBilhetes: number (total de bilhetes)
- successfulBilhetes: number (bilhetes com sucesso)
- failedBilhetes: number (bilhetes que falharam)
- totalPotentialWin: number (ganho potencial total)
- totalActualWin: number (ganho real total)
- profitLoss: number (lucro/prejuízo)
- status: enum ('pending' | 'completed' | 'partial' | 'failed')
- betConfig: json (configuração da aposta)
- summary: json (resumo por plataforma)
```

## 🔧 Serviços Criados

### 1. **BettingService** - Serviço Principal
```typescript
import { BettingService } from '@/services';

const bettingService = new BettingService();

// Criar nova aposta
const betBetting = await bettingService.createBetBetting({
  accountId: 'user-123',
  description: 'Aposta Brasileirão',
  betConfig: { markets: ['1x2'], minOdds: 1.5 },
  stakePerAccount: 10.00,
  totalAccounts: 3
});

// Buscar extrato
const extract = await bettingService.getBettingExtract('user-123', {
  period: 'week',
  status: 'completed'
});
```

### 2. **PlatformResponseProcessor** - Processador de Respostas
```typescript
import { PlatformResponseProcessor } from '@/services';

const processor = new PlatformResponseProcessor();

// Processar resposta FSSB
const result = await processor.processFSSBSuccess(
  betBettingId,
  betAccountId,
  'fssb',
  'site-name',
  balanceBefore,
  fssbResponse
);

// Processar resposta Biahosted
const result = await processor.processBiahostedSuccess(
  betBettingId,
  betAccountId,
  'biahosted',
  'lotogreen',
  balanceBefore,
  biahostedResponse
);
```

### 3. **BettingErrorHandler** - Tratamento de Erros
```typescript
import { BettingErrorHandler } from '@/services';

// Analisar erro
const error = BettingErrorHandler.analyzeError(originalError, 'fssb');

// Obter mensagem amigável
const message = BettingErrorHandler.getUserFriendlyMessage(error);

// Verificar se é recuperável
const isRecoverable = BettingErrorHandler.isRecoverableError(error);

// Obter sugestão de ação
const action = BettingErrorHandler.getSuggestedAction(error);
```

## 📊 Tipos de Retorno Suportados

### FSSB Response
```typescript
{
  SQLTicketID: "770037694931546112",
  potentialReturns: 0.94,
  status: "Open",
  bets: [{
    stake: 0.65,
    trueOdds: 1.45,
    selections: [{
      Name: "Justyna Gutowska",
      event: {
        EventName: "Justyna Gutowska vs Weronika Pelc",
        LeagueName: "Liga Masters Mulheres",
        SportName: "Tênis de mesa"
      },
      market: {
        Name: "Vencedor do tempo regulamentar"
      }
    }]
  }]
}
```

### Biahosted Response
```typescript
{
  requestId: "iE404mHi26jVwY5ENHS2",
  stakes: [15],
  betMarkets: [{
    eventName: "Flamengo vs. Racing Club",
    champName: "Copa Libertadores",
    sportName: "Futebol",
    odds: [{
      price: 4.3334,
      marketName: "Vencedor do encontro",
      selectionName: "Empate"
    }]
  }]
}
```

## 🚨 Tipos de Erro Tratados

### 1. **AUTHENTICATION**
- Erro de login/sessão expirada
- Credenciais inválidas
- Token expirado

### 2. **BALANCE_INSUFFICIENT**
- Saldo insuficiente
- Fundos insuficientes

### 3. **ODDS_CHANGED**
- Odds alteradas durante o processo
- Preço mudou

### 4. **MARKET_SUSPENDED**
- Mercado suspenso
- Mercado fechado

### 5. **NETWORK_ERROR**
- Erro de conexão
- Timeout
- Problemas de rede

### 6. **UNKNOWN_ERROR**
- Erros não categorizados
- Erros inesperados

## 🔄 Fluxo de Integração

### 1. **Criar Nova Aposta**
```typescript
// 1. Criar BetBetting
const betBetting = await bettingService.createBetBetting({
  accountId: 'user-123',
  description: 'Aposta automática',
  betConfig: betConfig,
  stakePerAccount: 10.00,
  totalAccounts: 3
});

// 2. Para cada conta, processar resposta
for (const account of accounts) {
  const result = await processor.processGenericResponse(
    betBetting.id,
    account.id,
    account.platform,
    account.site,
    account.balance,
    platformResponse,
    isError
  );
}
```

### 2. **Tratar Respostas**
```typescript
// Sucesso
if (response.success) {
  const result = await processor.processFSSBSuccess(
    betBettingId, accountId, platform, site, balance, response
  );
} else {
  // Erro
  const result = await processor.processFSSBError(
    betBettingId, accountId, platform, site, balance, error
  );
}
```

### 3. **Buscar Dados**
```typescript
// Extrato completo
const extract = await bettingService.getBettingExtract('user-123');

// Bilhetes específicos
const bilhetes = await bettingService.getBetBilhetesByBetBettingId(betBettingId);

// Aposta específica
const betting = await bettingService.getBetBettingById(betBettingId);
```

## 📈 Benefícios

### ✅ **Controle Total**
- Rastreamento de cada bilhete individual
- Histórico completo de apostas
- Análise de performance por conta/plataforma

### ✅ **Tratamento Robusto de Erros**
- Categorização automática de erros
- Mensagens amigáveis para usuários
- Sugestões de ações corretivas

### ✅ **Flexibilidade**
- Suporte a múltiplas plataformas
- Estrutura extensível para novas casas
- Dados completos preservados

### ✅ **Análise Avançada**
- Estatísticas detalhadas
- Identificação de padrões
- Otimização de estratégias

## 🚀 Próximos Passos

1. **Criar migrações** para as novas entidades
2. **Integrar** com `place-bet/route.ts` existente
3. **Implementar** sistema de atualização de resultados
4. **Criar APIs** para o frontend
5. **Testes** e validação completa

---

**🎯 Objetivo**: Sistema completo e robusto para controle total das apostas automáticas, com tratamento inteligente de erros e análise detalhada de performance.
