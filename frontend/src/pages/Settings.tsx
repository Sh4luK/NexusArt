import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  Lock, 
  Bell,
  Globe,
  CreditCard,
  Shield,
  Download,
  Save,
  Camera
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  business_name: z.string().min(2, 'Nome do negócio inválido').optional(),
  business_sector: z.string().optional(),
  phone: z.string().optional(),
  business_address: z.string().optional(),
  business_description: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
  new_password: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      business_name: user?.business_name || '',
      business_sector: (user as any)?.business_sector || '',
      phone: (user as any)?.phone || '',
      business_address: '',
      business_description: '',
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const businessSectors = [
    'Restaurante/Lanches',
    'Mercado/Supermercado',
    'Loja de Roupas',
    'Beleza e Estética',
    'Serviços Gerais',
    'Eletrônicos',
    'Farmácia',
    'Outro'
  ];

  const notificationSettings = [
    { id: 'whatsapp_notifications', label: 'Notificações por WhatsApp', description: 'Receba alertas sobre suas artes' },
    { id: 'email_notifications', label: 'Notificações por Email', description: 'Relatórios e atualizações' },
    { id: 'low_credit_alerts', label: 'Alertas de créditos baixos', description: 'Receba alertas quando seus créditos estiverem acabando' },
    { id: 'promotional_emails', label: 'Emails promocionais', description: 'Dicas e ofertas especiais' },
  ];

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser(data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    toast.success('Exportação iniciada. Você receberá um email em breve.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      toast.error('Funcionalidade de exclusão de conta ainda não implementada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card space-y-1">
            {[
              { id: 'profile', label: 'Perfil', icon: User },
              { id: 'security', label: 'Segurança', icon: Lock },
              { id: 'notifications', label: 'Notificações', icon: Bell },
              { id: 'billing', label: 'Cobrança', icon: CreditCard },
              { id: 'privacy', label: 'Privacidade', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <tab.icon className={`w-5 h-5 mr-3 ${
                  activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
              </div>

              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.full_name?.[0] || user?.business_name?.[0] || 'U'}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user?.full_name || 'Usuário'}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <button type="button" className="mt-2 text-sm text-primary-600 hover:text-primary-500">
                      Alterar foto
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...profileForm.register('full_name')}
                        className="input-base pl-10"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {profileForm.formState.errors.full_name && (
                      <p className="mt-1 text-sm text-danger-600">
                        {profileForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...profileForm.register('phone')}
                        className="input-base pl-10"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Negócio
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...profileForm.register('business_name')}
                        className="input-base pl-10"
                        placeholder="Nome do seu negócio"
                      />
                    </div>
                    {profileForm.formState.errors.business_name && (
                      <p className="mt-1 text-sm text-danger-600">
                        {profileForm.formState.errors.business_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Setor do Negócio
                    </label>
                    <select
                      {...profileForm.register('business_sector')}
                      className="input-base"
                    >
                      <option value="">Selecione um setor</option>
                      {businessSectors.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço do Negócio
                    </label>
                    <input
                      {...profileForm.register('business_address')}
                      className="input-base"
                      placeholder="Rua, número - Bairro, Cidade - Estado"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Negócio
                    </label>
                    <textarea
                      {...profileForm.register('business_description')}
                      className="input-base min-h-[100px]"
                      placeholder="Descreva seu negócio em poucas palavras..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary px-6 py-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center mb-6">
                  <Lock className="w-6 h-6 text-gray-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Alterar Senha</h2>
                </div>

                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        {...passwordForm.register('current_password')}
                        className="input-base pl-10"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    {passwordForm.formState.errors.current_password && (
                      <p className="mt-1 text-sm text-danger-600">
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        {...passwordForm.register('new_password')}
                        className="input-base pl-10"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                    {passwordForm.formState.errors.new_password && (
                      <p className="mt-1 text-sm text-danger-600">
                        {passwordForm.formState.errors.new_password.message}
                      </p>
                    )}
                    <ul className="mt-2 text-xs text-gray-500 space-y-1">
                      <li className="flex items-center">
                        {passwordForm.watch('new_password')?.length >= 8 ? '✓' : '○'} Pelo menos 8 caracteres
                      </li>
                      <li className="flex items-center">
                        {/[A-Z]/.test(passwordForm.watch('new_password') || '') ? '✓' : '○'} Pelo menos uma letra maiúscula
                      </li>
                      <li className="flex items-center">
                        {/[0-9]/.test(passwordForm.watch('new_password') || '') ? '✓' : '○'} Pelo menos um número
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        {...passwordForm.register('confirm_password')}
                        className={`input-base pl-10 ${
                          passwordForm.watch('new_password') && 
                          passwordForm.watch('confirm_password') && 
                          passwordForm.watch('new_password') === passwordForm.watch('confirm_password')
                            ? 'border-success-300 focus:ring-success-200'
                            : ''
                        }`}
                        placeholder="Digite a nova senha novamente"
                      />
                    </div>
                    {passwordForm.formState.errors.confirm_password && (
                      <p className="mt-1 text-sm text-danger-600">
                        {passwordForm.formState.errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-primary px-6 py-2"
                    >
                      {isSaving ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sessões Ativas</h3>
                    <p className="text-sm text-gray-600 mt-1">Gerencie seus dispositivos conectados</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Chrome no Windows</div>
                        <div className="text-sm text-gray-500">São Paulo, Brasil • Hoje 10:30</div>
                      </div>
                    </div>
                    <div className="text-sm text-success-600 font-medium">Ativo agora</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">iPhone 13</div>
                        <div className="text-sm text-gray-500">Ontem 15:45</div>
                      </div>
                    </div>
                    <button className="text-sm text-danger-600 hover:text-danger-700">
                      Desconectar
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="text-sm text-danger-600 hover:text-danger-700">
                    Desconectar todos os dispositivos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
                  <div className="space-y-4">
                    {notificationSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{setting.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{setting.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Frequência de Relatórios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="report_frequency"
                        value="daily"
                        className="h-4 w-4 text-primary-600"
                        defaultChecked
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Diário</div>
                        <div className="text-sm text-gray-500">Relatório todos os dias</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="report_frequency"
                        value="weekly"
                        className="h-4 w-4 text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Semanal</div>
                        <div className="text-sm text-gray-500">Toda segunda-feira</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="report_frequency"
                        value="monthly"
                        className="h-4 w-4 text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Mensal</div>
                        <div className="text-sm text-gray-500">Todo dia 1º do mês</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button className="btn-primary px-6 py-2">
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Método de Pagamento</h2>
                    <p className="text-sm text-gray-600 mt-1">Gerencie suas formas de pagamento</p>
                  </div>
                  <button className="btn-primary">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Adicionar Cartão
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-4">
                        <span className="text-blue-700 font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Cartão Visa</div>
                        <div className="text-sm text-gray-500">•••• 4242 • Válido até 12/2025</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-success-600 font-medium">Principal</div>
                      <button className="text-sm text-gray-600 hover:text-gray-900">Editar</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-red-100 rounded flex items-center justify-center mr-4">
                        <span className="text-red-700 font-bold">MC</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Mastercard</div>
                        <div className="text-sm text-gray-500">•••• 8881 • Válido até 08/2024</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-sm text-primary-600 hover:text-primary-700">Tornar principal</button>
                      <button className="text-sm text-danger-600 hover:text-danger-700">Remover</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Histórico de Faturas</h2>
                    <p className="text-sm text-gray-600 mt-1">Acompanhe seus pagamentos</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Tudo
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">15/01/2024</td>
                        <td className="px-6 py-4 text-sm text-gray-900">Plano Profissional - Mensal</td>
                        <td className="px-6 py-4 text-sm text-gray-900">R$ 99,90</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                            Pago
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-primary-600 hover:text-primary-700">
                            Ver fatura
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">15/12/2023</td>
                        <td className="px-6 py-4 text-sm text-gray-900">Plano Profissional - Mensal</td>
                        <td className="px-6 py-4 text-sm text-gray-900">R$ 99,90</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                            Pago
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-primary-600 hover:text-primary-700">
                            Ver fatura
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">15/11/2023</td>
                        <td className="px-6 py-4 text-sm text-gray-900">Upgrade para Profissional</td>
                        <td className="px-6 py-4 text-sm text-gray-900">R$ 99,90</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                            Pago
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-primary-600 hover:text-primary-700">
                            Ver fatura
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    Carregar mais faturas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center mb-6">
                  <Shield className="w-6 h-6 text-gray-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Privacidade e Dados</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Exportar Seus Dados</h3>
                    <p className="text-gray-600 mb-4">
                      Você pode exportar todos os seus dados do NexusArt, incluindo artes geradas, 
                      histórico de uso e informações da conta.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Solicitar Exportação de Dados
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      O arquivo será enviado para seu email em até 72 horas.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Excluir Conta</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Atenção: Esta ação é irreversível</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>Todos os seus dados serão excluídos permanentemente</li>
                            <li>Suas artes geradas serão removidas</li>
                            <li>Seu histórico de uso será apagado</li>
                            <li>Assinaturas ativas serão canceladas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={handleDeleteAccount}
                        className="btn-danger"
                      >
                        Excluir Minha Conta Permanentemente
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Configurações de Privacidade</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Perfil público</div>
                          <div className="text-sm text-gray-500">Tornar seu perfil visível para outros usuários</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Compartilhar dados anônimos</div>
                          <div className="text-sm text-gray-500">Ajudar a melhorar o NexusArt com dados anônimos de uso</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">LGPD - Lei Geral de Proteção de Dados</h3>
                <div className="space-y-3 text-gray-600">
                  <p>
                    O NexusArt está em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
                    Seus dados são tratados com segurança e transparência.
                  </p>
                  <p>
                    Para exercer seus direitos de titular de dados (acesso, correção, exclusão, etc.), 
                    entre em contato com nosso Encarregado de Proteção de Dados.
                  </p>
                  <div className="mt-4">
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                      Ler nossa Política de Privacidade completa →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;