'use client';

import { useState } from 'react';
import { mockBetBettings } from '@/types/betting';
import { BetBetting } from '@/types/betting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
import { 
  Calendar, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target
} from 'lucide-react';

interface BettingListProps {
  onViewDetails?: (betting: BetBetting) => void;
}

export function BettingList({ onViewDetails }: BettingListProps) {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      case 'partial':
        return 'Parcial';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const filteredBettings = mockBetBettings.filter(betting => {
    if (filterStatus !== 'all' && betting.status !== filterStatus) return false;
    // Aqui você pode adicionar mais filtros conforme necessário
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
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
                <option value="pending">Pendente</option>
                <option value="completed">Concluída</option>
                <option value="partial">Parcial</option>
                <option value="failed">Falhou</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Plataforma
              </label>
              <select 
                value={filterPlatform} 
                onChange={(e) => setFilterPlatform(e.target.value)}
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
                <option value="all">Todas</option>
                <option value="biahosted">Biahosted</option>
                <option value="fssb">FSSB</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Apostas */}
      <div className="space-y-4">
        {filteredBettings.map((betting) => (
          <Card key={betting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {betting.description || 'Aposta Automática'}
                    </h3>
                    <Badge className={getStatusColor(betting.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(betting.status)}
                        {getStatusText(betting.status)}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Stake Total</p>
                        <p className="font-semibold">R$ {betting.stakeTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Odd Média</p>
                        <p className="font-semibold">{betting.averageOdd.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Bilhetes</p>
                        <p className="font-semibold">
                          {betting.successfulBilhetes}/{betting.totalBilhetes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {betting.profitLoss && betting.profitLoss >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Resultado</p>
                        <p className={`font-semibold ${
                          betting.profitLoss && betting.profitLoss >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          R$ {betting.profitLoss ? betting.profitLoss.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Criado em {betting.createdAt.toLocaleDateString('pt-BR')} às{' '}
                      {betting.createdAt.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span>
                      {betting.totalBilhetes} bilhete{betting.totalBilhetes !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(betting)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBettings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma aposta encontrada</p>
              <p className="text-sm">Tente ajustar os filtros para ver mais resultados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
