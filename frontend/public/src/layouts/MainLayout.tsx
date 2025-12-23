import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Image, 
  Layout, 
  MessageSquare, 
  Settings, 
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Galeria', href: '/gallery', icon: Image, current: location.pathname === '/gallery' },
    { name: 'Templates', href: '/templates', icon: Layout, current: location.pathname === '/templates' },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare, current: location.pathname === '/whatsapp' },
    { name: 'Relatórios', href: '/reports', icon: BarChart3, current: location.pathname === '/reports' },
    { name: 'Planos', href: '/plans', icon: CreditCard, current: location.pathname === '/plans' },
    { name: 'Configurações', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NexusArt</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${item.current 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${
                    item.current ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User info mobile */}
            <div className="mt-8 px-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || user?.business_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-sm text-gray-700 hover:text-gray-900 p-2 rounded hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          {/* Sidebar header */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NexusArt</span>
            </Link>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${item.current 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${
                    item.current ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Help section */}
            <div className="mt-8 px-4">
              <Link
                to="/help"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <HelpCircle className="w-5 h-5 mr-3 text-gray-400" />
                Ajuda & Suporte
              </Link>
            </div>
          </div>

          {/* User info desktop */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold">
                  {getUserInitials()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.business_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        to="/plans"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Meu Plano
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Plano Atual</span>
                <span className="font-medium text-primary-600 capitalize">
                  {user?.plan_type === 'trial' ? 'Teste Gratuito' : user?.plan_type}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-500">Créditos</span>
                <span className="font-medium">
                  {user?.credits_used || 0} / {user?.credits_limit || 10}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden lg:ml-4 lg:flex lg:items-center">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    {navigation
                      .filter(item => item.current)
                      .map((item) => (
                        <li key={item.name}>
                          <div className="flex items-center">
                            <item.icon className="w-5 h-5 text-gray-400" />
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {item.name}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ol>
                </nav>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
              </button>

              {/* Quick actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/whatsapp"
                  className="btn-primary text-sm px-4 py-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Nova Arte
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;