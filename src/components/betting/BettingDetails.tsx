'use client';

import { mockBetBilhetes } from '@/types/betting';
import { BetBetting } from '@/types/betting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  MapPin
} from 'lucide-react';

interface BettingDetailsProps {
  betting: BetBetting;
  onBack: () => void;
}

export function BettingDetails({ betting, onBack }: BettingDetailsProps) {
  // Filtrar bilhetes desta aposta
  const bilhetes = mockBetBilhetes.filter(bilhete => bilhete.betBettingId === betting.id);

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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {betting.description || 'Detalhes da Aposta'}
          </h1>
          <p className="text-gray-600">
            Criado em {betting.createdAt.toLocaleDateString('pt-BR')} às{' '}
            {betting.createdAt.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Stake Total</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {betting.stakeTotal.toFixed(2)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Odd Média</p>
              <p className="text-xl font-bold text-gray-900">
                {betting.averageOdd.toFixed(2)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Bilhetes</p>
              <p className="text-xl font-bold text-gray-900">
                {betting.successfulBilhetes}/{betting.totalBilhetes}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {betting.profitLoss && betting.profitLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-red-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">Resultado</p>
              <p className={`text-xl font-bold ${
                betting.profitLoss && betting.profitLoss >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                R$ {betting.profitLoss ? betting.profitLoss.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Bilhetes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bilhetes ({bilhetes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bilhetes.map((bilhete) => (
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Saldo Antes</p>
                    <p className="font-semibold">R$ {bilhete.balanceBefore.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo Depois</p>
                    <p className="font-semibold">
                      R$ {bilhete.balanceAfter ? bilhete.balanceAfter.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Detalhes da Aposta */}
                {bilhete.betData && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Detalhes da Aposta</h4>
                    <div className="space-y-2 text-sm">
                      {bilhete.betData.bets && bilhete.betData.bets[0] && (
                        <>
                          {bilhete.betData.bets[0].selections && bilhete.betData.bets[0].selections[0] && (
                            <>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {bilhete.betData.bets[0].selections[0].event?.EventName || 
                                   bilhete.betData.bets[0].selections[0].event || 
                                   'Evento não especificado'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-gray-500" />
                                <span>
                                  {bilhete.betData.bets[0].selections[0].Name || 
                                   bilhete.betData.bets[0].selections[0].selection || 
                                   'Seleção não especificada'}
                                </span>
                              </div>
                              {bilhete.betData.bets[0].selections[0].event?.LeagueName && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span>{bilhete.betData.bets[0].selections[0].event.LeagueName}</span>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Mensagem de Erro */}
                {bilhete.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Erro:</strong> {bilhete.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
