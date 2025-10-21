import { 
  History, 
  Filter, 
  Download, 
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function HistoryContent() {
  const historyItems = [
    {
      id: 1,
      type: 'bet',
      status: 'success',
      description: 'Aposta vencedora - Martingale',
      amount: 150.00,
      platform: 'Lotogreen',
      timestamp: '2024-01-15 14:30:25',
      strategy: 'Martingale'
    },
    {
      id: 2,
      type: 'deposit',
      status: 'success',
      description: 'Depósito realizado',
      amount: 500.00,
      platform: 'McGames',
      timestamp: '2024-01-15 12:15:10',
      strategy: null
    },
    {
      id: 3,
      type: 'bet',
      status: 'loss',
      description: 'Aposta perdida - Fibonacci',
      amount: -75.00,
      platform: 'EstrelaBet',
      timestamp: '2024-01-15 10:45:33',
      strategy: 'Fibonacci'
    },
    {
      id: 4,
      type: 'withdrawal',
      status: 'pending',
      description: 'Saque solicitado',
      amount: -200.00,
      platform: 'JogoDeOuro',
      timestamp: '2024-01-15 09:20:15',
      strategy: null
    },
    {
      id: 5,
      type: 'bet',
      status: 'success',
      description: 'Aposta vencedora - D\'Alembert',
      amount: 89.50,
      platform: 'Lotogreen',
      timestamp: '2024-01-14 18:30:45',
      strategy: 'D\'Alembert'
    },
    {
      id: 6,
      type: 'strategy',
      status: 'info',
      description: 'Estratégia Labouchere iniciada',
      amount: 0.00,
      platform: 'McGames',
      timestamp: '2024-01-14 16:15:20',
      strategy: 'Labouchere'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'loss':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bet':
        return <TrendingUp className="w-4 h-4" />;
      case 'deposit':
        return <DollarSign className="w-4 h-4" />;
      case 'withdrawal':
        return <DollarSign className="w-4 h-4" />;
      case 'strategy':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const totalProfit = historyItems
    .filter(item => item.type === 'bet')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTransactions = historyItems.length;
  const successfulBets = historyItems.filter(item => item.status === 'success' && item.type === 'bet').length;
  const totalBets = historyItems.filter(item => item.type === 'bet').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
          <p className="text-gray-600">Visualize todas as suas transações e atividades</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Transações</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className={`text-2xl font-bold ${getAmountColor(totalProfit)}`}>
                R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-green-600">
                {totalBets > 0 ? ((successfulBets / totalBets) * 100).toFixed(1) : 0}%
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
              <p className="text-sm font-medium text-gray-600">Apostas Realizadas</p>
              <p className="text-2xl font-bold text-blue-600">{totalBets}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Atividades</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-gray-100 rounded">
                        {getTypeIcon(item.type)}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-medium ${getAmountColor(item.amount)}`}>
                        {item.amount !== 0 && `R$ ${Math.abs(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{item.platform}</span>
                    </span>
                    {item.strategy && (
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>{item.strategy}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Carregar mais atividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
