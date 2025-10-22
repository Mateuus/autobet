'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Eye,
  EyeOff,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AccountActions } from '@/components/AccountActions';
import { useAuth } from '@/hooks/useAuth';

interface Account {
  id: string;
  name: string;
  platform: string;
  email: string;
  balance: number;
  status: string;
  lastUpdate: string;
  baseUrl: string;
  isVisible: boolean;
}

function AccountsContent() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const hasLoadedRef = useRef(false);

  // Buscar contas do usuário
  const fetchAccounts = useCallback(async () => {
    try {
      console.log('🔄 Fazendo request para /api/accounts');
      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAccounts(data.data);
      } else {
        console.error('Erro ao buscar contas:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchAccounts();
    }
  }, [token, fetchAccounts]);

  const handleAddAccountSuccess = () => {
    fetchAccounts(); // Recarregar lista após adicionar conta
  };

  const handleAccountAction = (account: Account) => {
    setSelectedAccount(account);
    setShowActions(true);
  };

  const handleActionSuccess = (message: string) => {
    setNotification({ type: 'success', message });
    setShowActions(false);
    fetchAccounts(); // Recarregar lista para atualizar dados
    setTimeout(() => setNotification(null), 5000);
  };

  const handleActionError = (error: string) => {
    setNotification({ type: 'error', message: error });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
          <p className="text-gray-600">Gerencie suas contas de apostas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Conta</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Contas</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {accounts.filter(a => a.status === 'Ativo').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Plataformas</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(accounts.map(a => a.platform)).size}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Suas Contas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plataforma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Atualização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Carregando contas...
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma conta encontrada. Clique em &quot;Adicionar Conta&quot; para começar.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {account.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {account.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.platform}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {account.isVisible ? (
                        <span className="text-sm font-medium text-gray-900">
                          R$ {(account.balance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">••••••</span>
                      )}
                      <button className="ml-2 text-gray-400 hover:text-gray-600">
                        {account.isVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleAccountAction(account)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar Conta */}
      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddAccountSuccess}
      />

      {/* Modal de Ações da Conta */}
      {showActions && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ações da Conta</h2>
                <p className="text-sm text-gray-600">{selectedAccount.name}</p>
              </div>
              <button
                onClick={() => setShowActions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-6">
              <AccountActions
                accountId={selectedAccount.id}
                site={selectedAccount.name}
                onSuccess={handleActionSuccess}
                onError={handleActionError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notificações */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <AccountsContent />
    </ProtectedRoute>
  );
}
