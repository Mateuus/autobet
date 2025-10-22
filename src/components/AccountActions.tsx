'use client';

import { useState } from 'react';
import { RefreshCw, DollarSign, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AccountActionsProps {
  accountId: string;
  site: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function AccountActions({ accountId, site, onSuccess, onError }: AccountActionsProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const executeAction = async (action: string) => {
    setIsLoading(action);
    
    try {
      const response = await fetch(`/api/accounts/${accountId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = getSuccessMessage(action, data.data);
        onSuccess?.(message);
      } else {
        onError?.(data.error || 'Erro ao executar ação');
      }
    } catch {
      onError?.('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(null);
    }
  };

  const getSuccessMessage = (action: string, data: unknown) => {
    const dataObj = data as Record<string, unknown>;
    
    switch (action) {
      case 'refresh_tokens':
        return `Tokens renovados com sucesso para ${site}`;
      case 'get_balance':
        return `Saldo atualizado: R$ ${(dataObj.balance as number)?.toFixed(2) || '0.00'} para ${site}`;
      case 'get_profile':
        return `Perfil obtido com sucesso para ${site}`;
      default:
        return 'Ação executada com sucesso';
    }
  };

  const getButtonText = (action: string) => {
    switch (action) {
      case 'refresh_tokens':
        return 'Renovar Tokens';
      case 'get_balance':
        return 'Atualizar Saldo';
      case 'get_profile':
        return 'Buscar Perfil';
      default:
        return 'Executar';
    }
  };

  const getButtonIcon = (action: string) => {
    switch (action) {
      case 'refresh_tokens':
        return <RefreshCw className="w-4 h-4" />;
      case 'get_balance':
        return <DollarSign className="w-4 h-4" />;
      case 'get_profile':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const actions = [
    { id: 'refresh_tokens', label: 'Renovar Tokens', description: 'Faz login e gera novos tokens' },
    { id: 'get_balance', label: 'Atualizar Saldo', description: 'Busca saldo atual da conta' },
    { id: 'get_profile', label: 'Buscar Perfil', description: 'Obtém dados completos da conta' }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Ações da Conta</h3>
      
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {getButtonIcon(action.id)}
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </div>
            
            <button
              onClick={() => executeAction(action.id)}
              disabled={isLoading === action.id}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isLoading === action.id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading === action.id ? (
                <div className="flex items-center space-x-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Executando...</span>
                </div>
              ) : (
                getButtonText(action.id)
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
