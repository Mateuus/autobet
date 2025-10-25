'use client';

import { useState } from 'react';
import { mockBetBilhetes } from '@/types/betting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface AccountExtractProps {
  accountId?: string;
}

export function AccountExtract({ accountId }: AccountExtractProps) {
  const [selectedAccount, setSelectedAccount] = useState(accountId || 'all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock de contas disponíveis
  const mockAccounts = [
    { id: 'acc-1', email: 'conta1@fssb.com', platform: 'FSSB', site: 'FSSB' },
    { id: 'acc-2', email: 'conta2@lotogreen.com', platform: 'Biahosted', site: 'Lotogreen' },
    { id: 'acc-3', email: 'conta3@mcgames.com', platform: 'Biahosted', site: 'McGames' },
  ];

  // Filtrar bilhetes por conta
  const filteredBilhetes = mockBetBilhetes.filter(bilhete => {
    if (selectedAccount !== 'all' && bilhete.betAccountId !== selectedAccount) return false;
    return true;
  });

  // Calcular estatísticas da conta
  const accountStats = filteredBilhetes.reduce((stats, bilhete) => {
    stats.totalStake += bilhete.stake;
    stats.totalPotentialWin += bilhete.potentialWin || 0;
    stats.totalActualWin += bilhete.actualWin || 0;
    stats.totalBilhetes += 1;
    
    if (bilhete.status === 'won') stats.wonBilhetes += 1;
    if (bilhete.status === 'lost') stats.lostBilhetes += 1;
    if (bilhete.status === 'pending') stats.pendingBilhetes += 1;
    
    return stats;
  }, {
    totalStake: 0,
    totalPotentialWin: 0,
    totalActualWin: 0,
    totalBilhetes: 0,
    wonBilhetes: 0,
    lostBilhetes: 0,
    pendingBilhetes: 0
  });

  const successRate = accountStats.totalBilhetes > 0 
    ? (accountStats.wonBilhetes / accountStats.totalBilhetes) * 100 
    : 0;

  const profitLoss = accountStats.totalActualWin - accountStats.totalStake;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'won':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'won':
        return 'Ganhou';
      case 'lost':
        return 'Perdeu';
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getPlatformName = (platform: string, site: string) => {
    if (platform === 'fssb') return 'FSSB';
    if (platform === 'biahosted') {
      switch (site) {
        case 'lotogreen': return 'Lotogreen';
        case 'mcgames': return 'McGames';
        case 'estrelabet': return 'EstrelaBet';
        case 'jogodeouro': return 'Jogo de Ouro';
        default: return 'Biahosted';
      }
    }
    return platform;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Extrato por Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Selecionar Conta
              </label>
              <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{
                  display: 'flex',
                  height: '2.5rem',
                  width: '100%',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
              >
                <option value="all">Todas as contas</option>
                {mockAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.email} ({account.platform} - {account.site})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período
              </label>
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{
                  display: 'flex',
                  height: '2.5rem',
                  width: '100%',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
              >
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas da Conta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Apostado</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {accountStats.totalStake.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {successRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lucro/Prejuízo</p>
                <p className={`text-2xl font-bold ${
                  profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  R$ {profitLoss.toFixed(2)}
                </p>
              </div>
              {profitLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Bilhetes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accountStats.totalBilhetes}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Bilhetes da Conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Bilhetes ({filteredBilhetes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBilhetes.map((bilhete) => (
              <div key={bilhete.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {getPlatformName(bilhete.platform, bilhete.site)}
                    </h3>
                    <Badge className={getStatusColor(bilhete.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(bilhete.status)}
                        {getStatusText(bilhete.status)}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Bilhete ID</p>
                    <p className="font-mono text-sm">{bilhete.bilheteId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Stake</p>
                    <p className="font-semibold">R$ {bilhete.stake.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Odd</p>
                    <p className="font-semibold">{bilhete.odd.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganho Potencial</p>
                    <p className="font-semibold">
                      R$ {bilhete.potentialWin ? bilhete.potentialWin.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganho Real</p>
                    <p className={`font-semibold ${
                      bilhete.actualWin && bilhete.actualWin > 0 
                        ? 'text-green-600' 
                        : bilhete.actualWin === 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      R$ {bilhete.actualWin ? bilhete.actualWin.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-semibold">
                      {bilhete.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Detalhes da Aposta */}
                {bilhete.betData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Detalhes da Aposta</h4>
                    <div className="space-y-1 text-sm">
                      {bilhete.betData.bets && bilhete.betData.bets[0] && (
                        <>
                          {bilhete.betData.bets[0].selections && bilhete.betData.bets[0].selections[0] && (
                            <>
                              <p className="font-medium">
                                {bilhete.betData.bets[0].selections[0].event?.EventName || 
                                 bilhete.betData.bets[0].selections[0].event || 
                                 'Evento não especificado'}
                              </p>
                              <p className="text-gray-600">
                                {bilhete.betData.bets[0].selections[0].Name || 
                                 bilhete.betData.bets[0].selections[0].selection || 
                                 'Seleção não especificada'}
                              </p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredBilhetes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum bilhete encontrado</p>
              <p className="text-sm">Esta conta ainda não possui apostas registradas.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
