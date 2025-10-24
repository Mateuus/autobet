'use client';

import { useState } from 'react';
import { RefreshCw, DollarSign, User, Loader2, Power, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AccountActionsProps {
  accountId: string;
  site: string;
  platform?: string;
  email?: string;
  status?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onAccountDeleted?: () => void;
}

export function AccountActions({ accountId, site, platform, email, status, onSuccess, onError, onAccountDeleted }: AccountActionsProps) {
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
        
        // Se a ação foi de exclusão, chamar callback específico
        if (action === 'delete_account') {
          onAccountDeleted?.();
        }
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
      case 'toggle_status':
        return `${site} ${dataObj.isActive ? 'ativada' : 'desativada'} com sucesso`;
      case 'delete_account':
        return `Conta ${site} excluída com sucesso`;
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
      case 'toggle_status':
        return status === 'Ativo' ? 'Desativar' : 'Ativar';
      case 'delete_account':
        return 'Excluir';
      default:
        return 'Executar';
    }
  };

  const getButtonIcon = (action: string) => {
    switch (action) {
      case 'refresh_tokens':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'get_balance':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'get_profile':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'toggle_status':
        return <Power className="w-4 h-4 text-orange-600" />;
      case 'delete_account':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const actions = [
    { id: 'refresh_tokens', label: 'Renovar Tokens', description: 'Faz login e gera novos tokens' },
    { id: 'get_balance', label: 'Atualizar Saldo', description: 'Busca saldo atual da conta' },
    { id: 'get_profile', label: 'Buscar Perfil', description: 'Obtém dados completos da conta' },
    { 
      id: 'toggle_status', 
      label: status === 'Ativo' ? 'Desativar Conta' : 'Ativar Conta', 
      description: status === 'Ativo' ? 'Desativa a conta para parar operações' : 'Ativa a conta para operações'
    },
    { 
      id: 'delete_account', 
      label: 'Excluir Conta', 
      description: 'Remove permanentemente a conta do sistema'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Ações da Conta</h3>
      
      {/* Informações da Conta */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="text-xs font-medium text-gray-500 mb-2">Informações da Conta</div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Plataforma:</span>
            <span className="text-xs font-medium text-gray-900">{platform || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Site:</span>
            <span className="text-xs font-medium text-gray-900">{site}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Login:</span>
            <span className="text-xs font-medium text-gray-900">{email || 'N/A'}</span>
          </div>
        </div>
      </div>
      
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
                  : action.id === 'delete_account'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : action.id === 'toggle_status'
                      ? status === 'Ativo'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
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
