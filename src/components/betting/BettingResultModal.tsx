'use client';

import React from 'react';
import { X, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface BilheteResult {
  id: string;
  platform: string;
  site: string;
  bilheteId?: string;
  stake: number;
  odd: number;
  potentialWin?: number | null;
  balanceBefore: number;
  balanceAfter?: number | null;
  status: string;
  errorMessage?: string;
  createdAt: Date;
}

interface BetBettingResult {
  id: string;
  accountId: string;
  description?: string;
  stakeTotal: number;
  averageOdd: number;
  totalBilhetes: number;
  successfulBilhetes: number;
  failedBilhetes: number;
  totalPotentialWin?: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  betBetting: BetBettingResult | null;
  bilhetes: BilheteResult[];
  summary: {
    totalStake: number;
    successfulBets: number;
    failedBets: number;
    successRate: number;
    processingTime: number;
  };
  onRetry?: (bilheteId: string) => void;
}

export function BettingResultModal({ 
  isOpen, 
  onClose, 
  betBetting, 
  bilhetes,
  summary,
  onRetry 
}: BettingModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'won':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'lost':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completo', className: 'bg-green-100 text-green-800' },
      partial: { label: 'Parcial', className: 'bg-orange-100 text-orange-800' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-800' },
      won: { label: 'Ganhou', className: 'bg-green-100 text-green-800' },
      lost: { label: 'Perdeu', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
      refunded: { label: 'Reembolsado', className: 'bg-blue-100 text-blue-800' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resultado das Apostas</h2>
            <p className="text-sm text-gray-600">
              {summary.successfulBets} sucesso(s) | {summary.failedBets} falha(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumo da Aposta */}
          {betBetting && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Aposta</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Stake Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(betBetting.stakeTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Odd Média</p>
                  <p className="text-2xl font-bold text-gray-900">{betBetting.averageOdd.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bilhetes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {betBetting.successfulBilhetes}/{betBetting.totalBilhetes}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(betBetting.status)}</div>
                </div>
              </div>
              {betBetting.totalPotentialWin && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600">Ganho Potencial</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(betBetting.totalPotentialWin)}</p>
                </div>
              )}
            </div>
          )}

          {/* Bilhetes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bilhetes ({bilhetes.length})
            </h3>
            <div className="space-y-4">
              {bilhetes.map((bilhete) => (
                <div
                  key={bilhete.id}
                  className={`border rounded-lg p-4 ${
                    bilhete.status === 'pending' 
                      ? 'border-yellow-300 bg-yellow-50' 
                      : bilhete.status === 'won' 
                      ? 'border-green-300 bg-green-50'
                      : bilhete.status === 'lost' || bilhete.errorMessage
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(bilhete.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{bilhete.site}</h4>
                        <p className="text-sm text-gray-600">{bilhete.platform.toUpperCase()}</p>
                      </div>
                    </div>
                    {getStatusBadge(bilhete.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Stake</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(bilhete.stake)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Odd</p>
                      <p className="font-semibold text-gray-900">{bilhete.odd.toFixed(2)}</p>
                    </div>
                    {bilhete.potentialWin && (
                      <div>
                        <p className="text-gray-600">Ganho Potencial</p>
                        <p className="font-semibold text-green-600">{formatCurrency(bilhete.potentialWin)}</p>
                      </div>
                    )}
                    {bilhete.bilheteId && (
                      <div>
                        <p className="text-gray-600">ID do Bilhete</p>
                        <p className="font-mono text-xs text-gray-900">{bilhete.bilheteId.substring(0, 20)}...</p>
                      </div>
                    )}
                  </div>

                  {/* Erro ou ação */}
                  {bilhete.errorMessage && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-800 font-medium">Erro na aposta</p>
                          <p className="text-sm text-red-600 mt-1">{bilhete.errorMessage}</p>
                        </div>
                      </div>
                      {onRetry && (
                        <button
                          onClick={() => onRetry(bilhete.id)}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Tentar Novamente
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    {formatDate(bilhete.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Tempo de processamento: {summary.processingTime}ms
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
