'use client';

import { mockStats } from '@/types/betting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3 } from 'lucide-react';

export function BettingStatsCards() {
  const cards = [
    {
      title: 'Apostado Hoje',
      value: `R$ ${mockStats.totalApostadoHoje.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: mockStats.lucroPrejuizoHoje >= 0 ? '+' : '',
      changeValue: `R$ ${mockStats.lucroPrejuizoHoje.toFixed(2)}`,
      changeColor: mockStats.lucroPrejuizoHoje >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${mockStats.taxaSucessoHoje.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: mockStats.taxaSucessoSemana >= mockStats.taxaSucessoHoje ? '+' : '',
      changeValue: `${(mockStats.taxaSucessoSemana - mockStats.taxaSucessoHoje).toFixed(1)}%`,
      changeColor: mockStats.taxaSucessoSemana >= mockStats.taxaSucessoHoje ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Bilhetes Ativos',
      value: mockStats.bilhetesAtivos.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '',
      changeValue: `${mockStats.bilhetesPendentes} pendentes`,
      changeColor: 'text-gray-600'
    },
    {
      title: 'Performance Semanal',
      value: `R$ ${mockStats.lucroPrejuizoSemana.toFixed(2)}`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: mockStats.lucroPrejuizoSemana >= 0 ? '+' : '',
      changeValue: `${mockStats.taxaSucessoSemana.toFixed(1)}% sucesso`,
      changeColor: mockStats.lucroPrejuizoSemana >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className={`text-sm ${card.changeColor}`}>
                <span className="flex items-center gap-1">
                  {card.changeValue.startsWith('R$') ? (
                    <>
                      {card.change}
                      {card.changeValue}
                    </>
                  ) : (
                    card.changeValue
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function QuickStatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Apostado Este Mês</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {mockStats.totalApostadoMes.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lucro/Prejuízo Mensal</p>
              <p className={`text-xl font-bold ${mockStats.lucroPrejuizoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {mockStats.lucroPrejuizoMes.toFixed(2)}
              </p>
            </div>
            {mockStats.lucroPrejuizoMes >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Sucesso Mensal</p>
              <p className="text-xl font-bold text-gray-900">
                {mockStats.taxaSucessoMes.toFixed(1)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
