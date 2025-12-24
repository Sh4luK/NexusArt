import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building, 
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const businessSectors = [
  { value: 'restaurant', label: 'Restaurante/Lanches' },
  { value: 'supermarket', label: 'Mercado/Supermercado' },
  { value: 'clothing', label: 'Loja de Roupas' },
  { value: 'beauty', label: 'Beleza e Estética' },
  { value: 'services', label: 'Serviços Gerais' },
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'pharmacy', label: 'Farmácia' },
  { value: 'other', label: 'Outro' },
];

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirm_password: z.string(),
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf_cnpj: z.string()
    .min(11, 'CPF/CNPJ inválido')
    .max(18, 'CPF/CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  business_name: z.string().min(2, 'Nome do negócio inválido'),
  business_sector: z.string().min(1, 'Selecione um setor'),
}).refine((data) => data.password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      business_sector: 'restaurant',
    },
  });

  const validateStep = async (stepNumber: number) => {
    let fields: (keyof SignupFormData)[] = [];
    
    switch (stepNumber) {
      case 1:
        fields = ['full_name', 'cpf_cnpj', 'email'];
        break;
      case 2:
        fields = ['business_name', 'phone', 'business_sector'];
        break;
      case 3:
        fields = ['password', 'confirm_password'];
        break;
    }
    
    const result = await trigger(fields);
    if (result) {
      setStep(stepNumber);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await authRegister(data);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'Erro ao criar conta');
      } else {
        toast.error(error.message || 'Erro ao criar conta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Dados Pessoais' },
    { number: 2, title: 'Seu Negócio' },
    { number: 3, title: 'Segurança' },
  ];

  const watchedValues = watch();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
        <p className="text-gray-600">Comece gratuitamente por 7 dias</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step > s.number 
                    ? 'bg-success-100 text-success-700 border-2 border-success-200' 
                    : step === s.number
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }
                `}>
                  {step > s.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s.number
                  )}
                </div>
                <span className={`
                  text-xs mt-2 font-medium hidden sm:block
                  ${step >= s.number ? 'text-gray-700' : 'text-gray-400'}
                `}>
                  {s.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4">
                  <div className={`
                    h-full rounded-full
                    ${step > s.number ? 'bg-success-200' : 'bg-gray-200'}
                  `}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Dados Pessoais</h2>
              
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    {...register('full_name')}
                    className="input-base pl-10"
                    placeholder="Seu nome completo"
                    disabled={isLoading}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-700 mb-2">
                  CPF/CNPJ *
                </label>
                <input
                  id="cpf_cnpj"
                  {...register('cpf_cnpj')}
                  className="input-base"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  disabled={isLoading}
                />
                {errors.cpf_cnpj && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.cpf_cnpj.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="input-base pl-10"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Business Data */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Seu Negócio</h2>
              
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Negócio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="business_name"
                    {...register('business_name')}
                    className="input-base pl-10"
                    placeholder="Ex: Restaurante do João"
                    disabled={isLoading}
                  />
                </div>
                {errors.business_name && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.business_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    {...register('phone')}
                    className="input-base pl-10"
                    placeholder="(11) 99999-9999"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="business_sector" className="block text-sm font-medium text-gray-700 mb-2">
                  Setor do Negócio *
                </label>
                <select
                  id="business_sector"
                  {...register('business_sector')}
                  className="input-base"
                  disabled={isLoading}
                >
                  <option value="">Selecione um setor</option>
                  {businessSectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
                {errors.business_sector && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.business_sector.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Segurança</h2>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="input-base pl-10"
                    placeholder="Mínimo 8 caracteres"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li className={`flex items-center ${watchedValues.password?.length >= 8 ? 'text-success-600' : ''}`}>
                    {watchedValues.password?.length >= 8 ? '✓' : '○'} Pelo menos 8 caracteres
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(watchedValues.password || '') ? 'text-success-600' : ''}`}>
                    {/[A-Z]/.test(watchedValues.password || '') ? '✓' : '○'} Pelo menos uma letra maiúscula
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(watchedValues.password || '') ? 'text-success-600' : ''}`}>
                    {/[0-9]/.test(watchedValues.password || '') ? '✓' : '○'} Pelo menos um número
                  </li>
                </ul>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    type="password"
                    {...register('confirm_password')}
                    className={`input-base pl-10 ${
                      watchedValues.password && watchedValues.confirm_password && 
                      watchedValues.password === watchedValues.confirm_password
                        ? 'border-success-300 focus:ring-success-200'
                        : ''
                    }`}
                    placeholder="Digite a senha novamente"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">O que você ganha:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    7 dias grátis com todas as funcionalidades
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    10 artes promocionais gratuitas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Suporte por WhatsApp incluído
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sem necessidade de cartão de crédito
                  </li>
                </ul>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Concordo com os{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    Termos de Serviço
                  </Link>
                  {' '}e{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              )}
            </div>
            
            <div>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => validateStep(step + 1)}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta gratuita'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>

      {/* Security Info */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center text-xs text-gray-500">
          <Lock className="w-3 h-3 mr-1" />
          Seus dados estão protegidos com criptografia de ponta
        </div>
      </div>
    </div>
  );
};

export default Signup;