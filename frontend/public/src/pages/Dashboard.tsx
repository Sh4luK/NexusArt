import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Zap,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Edit3,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DashboardStats {
  total_generations: number;
  generations_today: number;
  generations_this_month: number;
  whatsapp_numbers_count: number;
  templates_count: number;
}

interface RecentGeneration {
  id: number;
  name: string;
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
  image_url?: string;
  prompt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [quickAction, setQuickAction] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me/stats`);
      return response.data;
    },
  });

  const { data: recentGenerations, isLoading: generationsLoading } = useQuery<RecentGeneration[]>({
    queryKey: ['recent-generations'],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          name: 'Promoção Pizza Especial',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          status: 'completed',
          prompt: 'Pizza grande + refrigerante por R$ 39,90',
        },
        {
          id: 2,
          name: 'Oferta Camisetas',
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          status: 'completed',
          prompt: 'Todas as camisetas com 30% de desconto',
        },
        {
          id: 3,
          name: 'Cardápio Semanal',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          status: 'processing',
          prompt: 'Cardápio completo da semana com preços',
        },
      ];
    },
  });

  const quickActions = [
    {
      id: 'whatsapp',
      title: 'Enviar pelo WhatsApp',
      description: 'Crie uma arte enviando mensagem',
      icon: MessageSquare,
      color: 'text-green-600 bg-green-100',
      action: () => {
        toast.success('Envie uma mensagem para nosso WhatsApp para criar uma arte!');
      }
    },
    {
      id: 'template',
      title: 'Usar Template',
      description: 'Escolha um template pronto',
      icon: ImageIcon,
      color: 'text-blue-600 bg-blue-100',
      action: () => {
        window.location.href = '/templates';
      }
    },
    {
      id: 'quick',
      title: 'Criação Rápida',
      description: 'Digite sua promoção aqui',
      icon: Zap,
      color: 'text-yellow-600 bg-yellow-100',
      action: () => {
        setQuickAction('quick');
      }
    },
  ];

  const statsCards = [
    {
      title: 'Gerações Hoje',
      value: stats?.generations_today || 0,
      change: '+2',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
      trend: 'up' as const,
    },
    {
      title: 'Total de Gerações',
      value: stats?.total_generations || 0,
      change: '+12%',
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-100',
      trend: 'up' as const,
    },
    {
      title: 'Templates',
      value: stats?.templates_count || 0,
      change: '+3',
      icon: ImageIcon,
      color: 'text-green-600 bg-green-100',
      trend: 'up' as const,
    },
    {
      title: 'WhatsApps',
      value: stats?.whatsapp_numbers_count || 0,
      change: user?.plan_type === 'trial' ? '1/1' : 'Ativos',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      trend: 'neutral' as const,
    },
  ];

  const tips = [
    'Use áudios para ser mais rápido - o sistema transcreve automaticamente',
    'Adicione emojis nas suas mensagens para artes mais divertidas',
    'Configure templates favoritos para usar rapidamente',
    'Compartilhe suas artes em grupos de WhatsApp para alcançar mais clientes',
  ];

  if (statsLoading || generationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="gradient-primary rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Olá, {user?.full_name || user?.business_name || 'Empreendedor'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Pronto para criar artes incríveis para seu negócio?
            </p>
            
            {/* Progress Bar */}
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span>Créditos usados</span>
                <span>{user?.credits_used || 0} de {user?.credits_limit || 10}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2.5">
                <div 
                  className="bg-white h-2.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((user?.credits_used || 0) / (user?.credits_limit || 10)) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-blue-200">
                {user?.plan_type === 'trial' ? (
                  <>Teste grátis • {10 - (user?.credits_used || 0)} artes restantes</>
                ) : (
                  <>Plano {user?.plan_type} • Renova em 30 dias</>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 lg:mt-0 lg:text-right">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="font-medium">{user?.plan_type === 'trial' ? 'Teste Grátis' : 'Plano Ativo'}</span>
            </div>
            <div className="mt-4">
              <Link
                to="/plans"
                className="inline-flex items-center text-white hover:text-blue-100 font-medium"
              >
                {user?.plan_type === 'trial' ? 'Upgrade agora' : 'Gerenciar plano'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Arte Rápida</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="card-hover text-left p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <div className={`inline-flex items-center mt-2 text-sm ${
                      stat.trend === 'up' ? 'text-success-600' : 
                      stat.trend === 'down' ? 'text-danger-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity and Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Generations */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gerações Recentes</h2>
            <Link
              to="/gallery"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentGenerations?.map((generation) => (
              <div key={generation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg ${
                    generation.status === 'completed' ? 'bg-green-100' :
                    generation.status === 'processing' ? 'bg-yellow-100' :
                    'bg-red-100'
                  } flex items-center justify-center mr-4`}>
                    <ImageIcon className={`w-5 h-5 ${
                      generation.status === 'completed' ? 'text-green-600' :
                      generation.status === 'processing' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{generation.name}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(generation.created_at).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    generation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    generation.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {generation.status === 'completed' ? 'Concluído' :
                     generation.status === 'processing' ? 'Processando' : 'Falhou'}
                  </div>
                </div>
              </div>
            ))}
            
            {(!recentGenerations || recentGenerations.length === 0) && (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma geração ainda</p>
                <button className="mt-3 btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira arte
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Dicas Rápidas</h2>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Precisa de ajuda?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Nosso time está disponível pelo WhatsApp para tirar suas dúvidas
                </p>
              </div>
            </div>
            <button className="mt-4 w-full btn-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Falar com suporte
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Banner for trial users */}
      {user?.plan_type === 'trial' && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900