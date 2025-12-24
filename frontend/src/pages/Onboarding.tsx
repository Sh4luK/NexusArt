import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Smartphone, 
  Palette, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Zap,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      number: 1,
      title: 'Conectar WhatsApp',
      description: 'Adicione o número que usará para enviar promoções',
      icon: MessageSquare,
      color: 'text-green-600 bg-green-100',
    },
    {
      number: 2,
      title: 'Escolher Estilo',
      description: 'Selecione o visual das suas artes',
      icon: Palette,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      number: 3,
      title: 'Primeira Arte',
      description: 'Crie sua primeira arte promocional',
      icon: Wand2,
      color: 'text-blue-600 bg-blue-100',
    },
  ];

  const styles = [
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Design limpo e atual',
      color: 'from-blue-500 to-cyan-400',
      icon: '✨',
      recommended: true,
    },
    {
      id: 'elegant',
      name: 'Elegante',
      description: 'Sofisticado para negócios premium',
      color: 'from-purple-500 to-pink-400',
      icon: '👔',
    },
    {
      id: 'fun',
      name: 'Divertido',
      description: 'Colorido e descontraído',
      color: 'from-orange-500 to-yellow-400',
      icon: '🎪',
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      description: 'Simples e direto ao ponto',
      color: 'from-gray-600 to-gray-400',
      icon: '⚫',
    },
    {
      id: 'bold',
      name: 'Chamativo',
      description: 'Grande destaque para promoções',
      color: 'from-red-500 to-orange-400',
      icon: '🔥',
    },
    {
      id: 'custom',
      name: 'Personalizar',
      description: 'Escolher depois',
      color: 'from-green-500 to-emerald-400',
      icon: '🎨',
    },
  ];

  const handleConnectWhatsApp = async () => {
    if (!whatsappNumber) {
      toast.error('Digite um número de WhatsApp');
      return;
    }

    setIsLoading(true);
    try {
      // Simular conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('WhatsApp conectado com sucesso!');
      setStep(2);
    } catch (error) {
      toast.error('Erro ao conectar WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Salvar configurações
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/onboarding`, {
        whatsapp_number: whatsappNumber,
        preferred_style: selectedStyle,
      });
      
      toast.success('Configuração concluída!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vamos configurar seu NexusArt! 🚀
          </h1>
          <p className="text-xl text-gray-600">
            Em apenas 3 passos você estará pronto para criar artes incríveis
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-3
                    ${step >= s.number ? s.color : 'bg-gray-100 text-gray-400'}
                    ${step === s.number ? 'ring-4 ring-offset-2 ring-opacity-50' : ''}
                    ${step === s.number && s.number === 1 ? 'ring-green-200' : ''}
                    ${step === s.number && s.number === 2 ? 'ring-purple-200' : ''}
                    ${step === s.number && s.number === 3 ? 'ring-blue-200' : ''}
                  `}>
                    <s.icon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${
                      step >= s.number ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {s.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 hidden md:block">
                      {s.description}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="w-24 h-1 mx-8 relative hidden md:block">
                    <div className={`
                      absolute inset-0 rounded-full
                      ${step > s.number ? 'bg-gradient-to-r from-green-200 to-purple-200' : 'bg-gray-200'}
                    `}></div>
                    <div className={`
                      absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-purple-400
                      transition-all duration-500 ease-out
                      ${step > s.number ? 'w-full' : 'w-0'}
                    `}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-strong p-8">
          {/* Step 1: WhatsApp Connection */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Conectar WhatsApp</h2>
                  <p className="text-gray-600">
                    Adicione o número que usará para criar e receber artes
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* How it works */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                    Como funciona:
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-700 font-bold">1</span>
                      </div>
                      <div className="font-medium text-gray-900">Envie mensagem</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Texto ou áudio com sua promoção
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-700 font-bold">2</span>
                      </div>
                      <div className="font-medium text-gray-900">Receba arte</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Em segundos, arte pronta no WhatsApp
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-green-700 font-bold">3</span>
                      </div>
                      <div className="font-medium text-gray-900">Compartilhe</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Envie para clientes e grupos
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Seu número do WhatsApp (com DDD)
                  </label>
                  <div className="max-w-md">
                    <div className="flex">
                      <div className="flex-shrink-0 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl px-4 py-4 flex items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                            <MessageSquare className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium">+55</span>
                        </div>
                      </div>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="flex-1 px-4 py-4 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="11 99999-9999"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Enviaremos um código de verificação para este número
                    </p>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Privacidade Garantida</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Seu número é usado apenas para envio/recebimento de artes
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Não enviamos spam ou compartilhamos seu contato
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Conformidade com a LGPD
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Style */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Escolha seu Estilo</h2>
                  <p className="text-gray-600">
                    Selecione o visual que combina com seu negócio
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${selectedStyle === style.id 
                          ? 'border-purple-500 bg-purple-50 transform scale-[1.02]' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`h-24 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center text-4xl mb-4`}>
                        {style.icon}
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{style.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                        </div>
                        {selectedStyle === style.id && (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      {style.recommended && (
                        <div className="mt-3 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recomendado
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Style Preview */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Prévia do Estilo</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-center text-sm text-gray-500 mb-2">Sua mensagem</div>
                      <div className="bg-green-50 rounded-lg p-4 text-green-800">
                        "Promoção: Pizza grande + refrigerante por R$ 39,90"
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-center text-sm text-gray-500 mb-2">Arte gerada</div>
                      <div className={`
                        h-32 rounded-lg flex items-center justify-center
                        ${selectedStyle === 'modern' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                          selectedStyle === 'elegant' ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                          selectedStyle === 'fun' ? 'bg-gradient-to-r from-orange-500 to-yellow-400' :
                          selectedStyle === 'minimal' ? 'bg-gradient-to-r from-gray-600 to-gray-400' :
                          selectedStyle === 'bold' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                          'bg-gradient-to-r from-green-500 to-emerald-400'}
                      `}>
                        <span className="text-white font-bold text-center">
                          {styles.find(s => s.id === selectedStyle)?.name.toUpperCase()}
                          <br/>
                          PROMOÇÃO ESPECIAL!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: First Generation */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Wand2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Primeira Arte</h2>
                  <p className="text-gray-600">
                    Vamos criar sua primeira arte promocional
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Quick Test */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Teste Rápido ✨
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Text Test */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Teste com Texto</div>
                          <div className="text-sm text-gray-600">Envie essa mensagem</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-2">Para: {process.env.REACT_APP_WHATSAPP_NUMBER}</div>
                          <div className="font-medium">
                            "Promoção especial: todas as pizzas com 20% de desconto hoje!"
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">↓</div>
                          <div className="text-sm text-gray-500">Em segundos você receberá:</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg p-4">
                          <div className="h-24 rounded bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                            <span className="text-white font-bold text-center">
                              PIZZARIA<br/>
                              -20% HOJE!
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio Test */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Smartphone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Teste com Áudio</div>
                          <div className="text-sm text-gray-600">Grave um áudio</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-2">Diga no áudio:</div>
                          <div className="font-medium">
                            "Oferta da semana: comprando duas camisetas, a terceira sai pela metade do preço!"
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">↓</div>
                          <div className="text-sm text-gray-500">Sistema irá:</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                          <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                              Transcrever o áudio automaticamente
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                              Criar arte com estilo {styles.find(s => s.id === selectedStyle)?.name.toLowerCase()}
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                              Enviar de volta pelo WhatsApp
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ready Message */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Você está pronto! 🎉
                  </h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Agora você pode criar artes promocionais em segundos, direto pelo WhatsApp. 
                    Lembre-se: você tem {user?.credits_limit || 10} artes gratuitas para testar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between items-center">
            <div>
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Pular configuração
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1) {
                      handleConnectWhatsApp();
                    } else {
                      setStep(step + 1);
                    }
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-xl hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Conectando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      Ir para o Painel
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;