'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard, 
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const publicNavigation = [
    { name: 'Início', href: '/', icon: LayoutDashboard, isAuth: false },
  ];

  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isAuth: true },
    { name: 'Contas', href: '/dashboard/accounts', icon: CreditCard, isAuth: true },
    { name: 'Estratégias', href: '/dashboard/strategies', icon: BarChart3, isAuth: true },
    { name: 'Histórico', href: '/dashboard/history', icon: History, isAuth: true },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings, isAuth: true },
  ];

  const adminNavigation = [
    { name: 'Usuários', href: '/dashboard/users', icon: Users, isAuth: true },
  ];

  const navigation = user 
    ? [...authenticatedNavigation, ...adminNavigation] 
    : publicNavigation;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AutoBet</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <>
            {!isCollapsed ? (
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={logout}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Sair</span>}
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className={`w-full flex items-center space-x-3 px-3 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Entrar</span>}
            </Link>
            <Link
              href="/register"
              className={`w-full flex items-center space-x-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Registrar</span>}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

