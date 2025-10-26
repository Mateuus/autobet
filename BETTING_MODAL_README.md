# 🎯 Modal de Resultados de Apostas

## 📋 Visão Geral

O `BettingResultModal` é um componente modal que exibe os resultados de uma rodada de apostas após sua conclusão. Ele mostra informações detalhadas sobre a aposta, cada bilhete criado, e oferece a opção de retentar apostas que falharam.

## 🎨 Componente

**Localização**: `src/components/betting/BettingResultModal.tsx`

### Props

```typescript
interface BettingResultModalProps {
  isOpen: boolean;           // Controla se o modal está aberto
  onClose: () => void;       // Função para fechar o modal
  betBetting: BetBettingResult | null; // Dados da aposta principal
  bilhetes: BilheteResult[]; // Array de bilhetes individuais
  summary: {
    totalStake: number;
    successfulBets: number;
    failedBets: number;
    successRate: number;
    processingTime: number;
  };
  onRetry?: (bilheteId: string) => void; // Callback para retentar apostas com erro
}
```

## 🚀 Como Usar

### Exemplo 1: Integração Completa com API

```typescript
import { useState } from 'react';
import { BettingResultModal } from '@/components/betting/BettingResultModal';

function MyBettingComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bettingResult, setBettingResult] = useState(null);

  const handlePlaceBet = async () => {
    const response = await fetch('/api/betting/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'fssb',
        data: {
          selections: [...],
          stakes: [0.65]
        }
      })
    });

    const result = await response.json();
    setBettingResult(result);
    setIsModalOpen(true);
  };

  return (
    <>
      <button onClick={handlePlaceBet}>Fazer Aposta</button>
      
      {bettingResult && (
        <BettingResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          betBetting={bettingResult.betBetting}
          bilhetes={bettingResult.bilhetes}
          summary={bettingResult.summary}
          onRetry={(bilheteId) => {
            console.log('Retentar aposta:', bilheteId);
          }}
        />
      )}
    </>
  );
}
```

### Exemplo 2: Uso Direto com Dados Mock

```typescript
import { BettingResultModal } from '@/components/betting/BettingResultModal';

function TestModal() {
  const [isOpen, setIsOpen] = useState(false);

  const mockData = {
    betBetting: {
      id: '123',
      accountId: 'user-1',
      description: 'Aposta teste',
      stakeTotal: 1.95,
      averageOdd: 1.77,
      totalBilhetes: 3,
      successfulBilhetes: 3,
      failedBilhetes: 0,
      totalPotentialWin: 3.46,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    bilhetes: [
      {
        id: '1',
        platform: 'fssb',
        site: 'bet7k',
        bilheteId: '770037694931546112',
        stake: 0.65,
        odd: 1.45,
        potentialWin: 0.94,
        balanceBefore: 3.71,
        balanceAfter: 3.06,
        status: 'pending',
        createdAt: new Date()
      }
    ],
    summary: {
      totalStake: 1.95,
      successfulBets: 3,
      failedBets: 0,
      successRate: 100,
      processingTime: 9033
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Ver Resultado</button>
      
      <BettingResultModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...mockData}
        onRetry={(id) => console.log('Retry:', id)}
      />
    </>
  );
}
```

## 📊 Estrutura de Dados

### BetBetting (Aposta Principal)

```typescript
{
  id: string;
  accountId: string;
  description?: string;
  stakeTotal: number;        // Stake total investido
  averageOdd: number;        // Odd média
  totalBilhetes: number;     // Total de bilhetes
  successfulBilhetes: number;// Bilhetes com sucesso
  failedBilhetes: number;    // Bilhetes que falharam
  totalPotentialWin?: number;// Ganho potencial total
  status: 'pending' | 'completed' | 'partial' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Bilhete (Ticket Individual)

```typescript
{
  id: string;
  platform: string;          // 'fssb' | 'biahosted'
  site: string;              // 'bet7k', 'lotogreen', etc.
  bilheteId?: string;        // ID do bilhete na casa
  stake: number;
  odd: number;
  potentialWin?: number;
  balanceBefore: number;
  balanceAfter?: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';
  errorMessage?: string;     // Mensagem de erro se houver
  createdAt: Date;
}
```

## 🎨 Status e Badges

O modal exibe diferentes badges baseados no status:

- **Pendente** - Amarelo (Yellow)
- **Completo** - Verde (Green)
- **Parcial** - Laranja (Orange)
- **Falhou** - Vermelho (Red)
- **Ganhou** - Verde (Green)
- **Perdeu** - Vermelho (Red)
- **Cancelado** - Cinza (Gray)
- **Reembolsado** - Azul (Blue)

## 🔄 Retry de Apostas

Quando uma aposta falha, o modal mostra um botão "Tentar Novamente":

```typescript
onRetry={(bilheteId) => {
  // Implementar lógica de retry
  // Ex: buscar dados do bilhete e refazer a aposta
  fetch(`/api/betting/retry/${bilheteId}`, {
    method: 'POST',
    body: JSON.stringify({ /* novos dados */ })
  });
}}
```

## 🎯 Funcionalidades

✅ **Resumo da Aposta**
- Stake total investido
- Odd média de todos os bilhetes
- Número de bilhetes (sucessos/total)
- Status geral da aposta
- Ganho potencial total

✅ **Lista de Bilhetes**
- Informações por plataforma
- Detalhes de cada bilhete
- Status individual
- Mensagens de erro
- Opção de retry para falhas

✅ **UX/UI**
- Design moderno e responsivo
- Cores e ícones informativos
- Formatação brasileira (moeda, datas)
- Scroll para listas grandes
- Animações suaves

## 📝 Notas Importantes

1. **Formatação Automática**: Todas as moedas e datas são formatadas automaticamente para pt-BR
2. **Scroll**: O modal tem scroll automático para listas grandes
3. **Responsivo**: Funciona bem em desktop e mobile
4. **Tipagem**: Totalmente tipado com TypeScript
5. **Performance**: Renderização otimizada com React

---

**💡 Dica**: Use o arquivo `BettingPlaceExample.tsx` como referência completa de integração!
