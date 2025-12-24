import React, { useState } from 'react';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Users, 
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    generations: number;
    whatsappNumbers: number;
    templates: number;
    support: string;
  };
  popular?: boolean;
}

const Plans: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Básico',
      description: 'Ideal para pequenos negócios que estão começando',
      priceMonthly: 49.90,
      priceYearly: 499.90,
      features: [
        '50 gerações por mês',
        '1 número WhatsApp conectado',
        'Templates básicos',
        'Suporte por email',
        'Dashboard web',
        'Histórico de 30 dias'
      ],
      limits: {
        generations: 50,
        whatsappNumbers: 1,
        templates: 10,
        support: 'email'
      }
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Para negócios em crescimento que precisam de mais recursos',
      priceMonthly: 99.90,
      priceYearly: 999.90,
      features: [
        '200 gerações por mês',
        '3 números WhatsApp',
        'Templates premium',
        'Suporte prioritário',
        'Relatórios avançados',
        'API access',
        'Sem marca d\'água',
        'Exportação em alta qualidade'
      ],
      limits: {
        generations: 200,
        whatsappNumbers: 3,
        templates: 50,
        support: 'priority'
      },
      popular: true
    },
    {
      id: 'annual',
      name: 'Anual',
      description: 'Melhor custo-benefício com 2 meses grátis',
      priceMonthly: 83.25,
      priceYearly: 999.90,
      features: [
        'Todas as features do Profissional',
        '2 meses grátis (no pagamento anual)',
        'Prioridade máxima',
        'Consultoria inicial gratuita',
        'Backup automático',
        'Domínio personalizado',
        'Treinamento exclusivo'
      ],
      limits: {
        generations: 200,
        whatsappNumbers: 3,
        templates: 999,
        support: 'dedicated'
      }
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Selecione um plano primeiro');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const plan = plans.find(p => p.id === selectedPlan);
      toast.success(`Plano ${plan?.name} ativado com sucesso!`);
      
      // In production, redirect to payment or show payment modal
    } catch (error) {
      toast.error('Erro ao processar assinatura');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateSavings = (plan: Plan) => {
    if (billingCycle === 'yearly') {
      const monthlyCost = plan.priceMonthly * 12;
      const savings = monthlyCost - plan.priceYearly;
      const percentage = (savings / monthlyCost) * 100;
      return { savings, percentage };
    }
    return { savings: 0, percentage: 0 };
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === user?.plan_type);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Escolha seu Plano</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Planos simples e transparentes para seu negócio crescer
        </p>
      </div>

      {/* Current Plan Banner */}
      {currentPlan && user?.plan_type !== 'trial' && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Seu Plano Atual: {currentPlan.name}
              </h3>
              <p className="text-gray-600 mt-1">
                {user?.credits_used || 0} de {user?.credits_limit || 0} gerações usadas este mês
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg border border-primary-200">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Plano Ativo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual <span className="ml-2 text-sm text-green-600 font-medium">-17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const savings = calculateSavings(plan);
          const isCurrentPlan = plan.id === user?.plan_type;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-primary-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-primary-300'
              } ${isCurrentPlan ? 'bg-primary-50' : 'bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Seu Plano Atual
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {billingCycle === 'monthly' ? plan.priceMonthly.toFixed(2) : plan.priceYearly.toFixed(2)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && savings.savings > 0 && (
                    <div className="mt-2 text-green-600 font-medium">
                      Economize R$ {savings.savings.toFixed(2)} ({savings.percentage.toFixed(0)}%)
                    </div>
                  )}
                  
                  {billingCycle === 'monthly' && plan.id === 'annual' && (
                    <div className="text-sm text-gray-500 mt-1">
                      Equivalente a R$ {plan.priceMonthly.toFixed(2)}/mês
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Limites do Plano</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <ImageIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">{plan.limits.generations} gerações/mês</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">{plan.limits.whatsappNumbers} WhatsApps</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">{plan.limits.templates} templates</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-gray-600">Suporte {plan.limits.support}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Plano Atual'
                  ) : selectedPlan === plan.id ? (
                    'Selecionado'
                  ) : (
                    'Selecionar Plano'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Plan Actions */}
      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {plans.find(p => p.id === selectedPlan)?.name}
                </h3>
                <p className="text-gray-600">
                  R$ {billingCycle === 'monthly' 
                    ? plans.find(p => p.id === selectedPlan)?.priceMonthly.toFixed(2)
                    : plans.find(p => p.id === selectedPlan)?.priceYearly.toFixed(2)
                  } / {billingCycle === 'monthly' ? 'mês' : 'ano'}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 inline-block mr-2" />
                      Assinar Agora
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Perguntas Frequentes
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <HelpCircle className="w-5 h-5 text-primary-600 mr-2" />
              Posso mudar de plano depois?
            </h4>
            <p className="text-gray-600 text-sm">
              Sim! Você pode fazer upgrade ou downgrade a qualquer momento. 
              Os valores são calculados proporcionalmente.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <HelpCircle className="w-5 h-5 text-primary-600 mr-2" />
              O que acontece se eu usar todos os créditos?
            </h4>
            <p className="text-gray-600 text-sm">
              Você pode comprar créditos extras ou fazer upgrade do plano. 
              Enquanto isso, ainda terá acesso ao dashboard e histórico.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <HelpCircle className="w-5 h-5 text-primary-600 mr-2" />
              Tem fidelidade no contrato?
            </h4>
            <p className="text-gray-600 text-sm">
              Não! Você pode cancelar a qualquer momento sem multa. 
              Seu acesso permanece até o fim do período pago.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <HelpCircle className="w-5 h-5 text-primary-600 mr-2" />
              Como funciona o suporte?
            </h4>
            <p className="text-gray-600 text-sm">
              No plano Básico, suporte por email em 24h. 
              No Profissional, suporte prioritário por WhatsApp em até 2h.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card overflow-hidden">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Comparação de Planos</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 text-left font-medium text-gray-900">Recurso</th>
                <th className="py-4 text-center font-medium text-gray-900">Básico</th>
                <th className="py-4 text-center font-medium text-gray-900">Profissional</th>
                <th className="py-4 text-center font-medium text-gray-900">Anual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">Gerações por mês</td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">50</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">200</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">200</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">Números WhatsApp</td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">1</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">3</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">3</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">Templates</td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">10</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">50</span>
                </td>
                <td className="py-4 text-center">
                  <span className="font-medium text-gray-900">Ilimitados</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">Suporte</td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-600">Email (24h)</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-600">WhatsApp (2h)</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-600">Dedicado (1h)</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">API Access</td>
                <td className="py-4 text-center">-</td>
                <td className="py-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="py-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-600">Relatórios Avançados</td>
                <td className="py-4 text-center">-</td>
                <td className="py-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="py-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Sales */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Precisa de um plano personalizado?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Para empresas com necessidades especiais ou múltiplos usuários, 
            temos planos empresariais com condições especiais.
          </p>
          <button className="btn-primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Falar com Vendas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plans;