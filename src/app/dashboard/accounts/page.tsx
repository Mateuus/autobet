'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Eye,
  EyeOff,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
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
  password: string;
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
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [clickedAccount, setClickedAccount] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleActionSuccess = (message: string) => {
    setNotification({ type: 'success', message });
    fetchAccounts(); // Recarregar lista para atualizar dados
    setTimeout(() => setNotification(null), 5000);
  };

  const handleActionError = (error: string) => {
    setNotification({ type: 'error', message: error });
    setTimeout(() => setNotification(null), 5000);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const toggleAccountActions = (accountId: string) => {
    setClickedAccount(prev => prev === accountId ? null : accountId);
  };

  // Fechar modal quando pressionar ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setClickedAccount(null);
      }
    };

    if (clickedAccount) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [clickedAccount]);

  const refreshAllAccounts = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/accounts/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'Contas atualizadas com sucesso!' });
        fetchAccounts(); // Recarregar lista com dados atualizados
      } else {
        setNotification({ type: 'error', message: data.error || 'Erro ao atualizar contas' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Erro ao atualizar contas' });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setNotification(null), 5000);
    }
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
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshAllAccounts}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Contas'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Conta</span>
          </button>
        </div>
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
                  Login / Senha
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
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-slate-800">
                        <Image 
                          src={`/bookmakers/logo/${account.name.toLowerCase()}.webp`}
                          alt={`Logo ${account.name}`}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Login:</span> {account.email}
                      </div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className="font-medium">Senha:</span>
                        <span className="ml-1">
                          {showPasswords[account.id] ? account.password : '••••••••'}
                        </span>
                        <button 
                          onClick={() => togglePasswordVisibility(account.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords[account.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative account-actions-container">
                      <button 
                        onClick={() => toggleAccountActions(account.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {/* Tooltip */}
                      {clickedAccount === account.id && (
                        <>
                          {/* Overlay escuro */}
                          <div className="fixed inset-0 bg-black bg-opacity-25 z-40" 
                               onClick={() => setClickedAccount(null)}></div>
                          
                          {/* Modal de ações */}
                          <div className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px]"
                               style={{
                                 top: '50%',
                                 left: '50%',
                                 transform: 'translate(-50%, -50%)'
                               }}>
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-gray-500 mb-2">Ações da Conta</div>
                              <AccountActions
                                accountId={account.id}
                                site={account.name}
                                platform={account.platform}
                                email={account.email}
                                status={account.status}
                                onSuccess={handleActionSuccess}
                                onError={handleActionError}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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
