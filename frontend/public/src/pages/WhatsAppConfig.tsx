import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  CheckCircle,
  XCircle,
  Smartphone,
  QrCode,
  Copy,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface WhatsAppNumber {
  id: number;
  phone_number: string;
  is_verified: boolean;
  is_active: boolean;
  messages_received: number;
  messages_sent: number;
  last_used_at: string | null;
  created_at: string;
}

const WhatsAppConfig: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: numbers, isLoading } = useQuery<WhatsAppNumber[]>({
    queryKey: ['whatsapp-numbers'],
    queryFn: async () => {
      // Mock data
      return [
        {
          id: 1,
          phone_number: '+5511999999999',
          is_verified: true,
          is_active: true,
          messages_received: 42,
          messages_sent: 38,
          last_used_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T08:00:00Z'
        }
      ];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        id: Date.now(),
        phone_number: phoneNumber,
        is_verified: false,
        is_active: true,
        messages_received: 0,
        messages_sent: 0,
        last_used_at: null,
        created_at: new Date().toISOString()
      };
    },
    onSuccess: (newNumber) => {
      queryClient.setQueryData<WhatsAppNumber[]>(['whatsapp-numbers'], (old) => 
        [...(old || []), newNumber]
      );
      setShowAddForm(false);
      setNewPhoneNumber('');
      toast.success('Número adicionado! Envie o código de verificação.');
    },
    onError: () => {
      toast.error('Erro ao adicionar número');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<WhatsAppNumber[]>(['whatsapp-numbers'], (old) => 
        old?.filter(num => num.id !== id) || []
      );
      toast.success('Número removido');
    },
    onError: () => {
      toast.error('Erro ao remover número');
    }
  });

  const handleAddNumber = () => {
    if (!newPhoneNumber.trim()) {
      toast.error('Digite um número de WhatsApp');
      return;
    }

    // Basic phone validation
    const phoneDigits = newPhoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error('Número de telefone inválido');
      return;
    }

    addMutation.mutate(newPhoneNumber);
  };

  const handleVerifyNumber = (id: number) => {
    toast.success('Código de verificação enviado para o WhatsApp!');
    // In production, trigger verification code sending
  };

  const handleCopyNumber = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber);
    toast.success('Número copiado!');
  };

  const handleSendTestMessage = (phoneNumber: string) => {
    toast.success('Mensagem de teste enviada!');
    // In production, send test message
  };

  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+5511999999999';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar WhatsApp</h1>
          <p className="text-gray-600 mt-1">
            Conecte seus números para criar e receber artes
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
          disabled={numbers && numbers.length >= 3} // Example limit
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Número
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {numbers?.reduce((sum, num) => sum + num.messages_received, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Mensagens recebidas</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{numbers?.length || 0}</div>
              <div className="text-sm text-gray-600">Números conectados</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {numbers?.filter(num => num.is_verified).length || 0}
              </div>
              <div className="text-sm text-gray-600">Números verificados</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
          Como funciona?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-700 font-bold text-xl">1</span>
            </div>
            <div className="font-medium text-gray-900">Adicione seu número</div>
            <div className="text-sm text-gray-600 mt-2">
              Conecte o WhatsApp que usará para enviar promoções
            </div>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-700 font-bold text-xl">2</span>
            </div>
            <div className="font-medium text-gray-900">Verifique o número</div>
            <div className="text-sm text-gray-600 mt-2">
              Enviaremos um código via WhatsApp para confirmar
            </div>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-700 font-bold text-xl">3</span>
            </div>
            <div className="font-medium text-gray-900">Comece a criar</div>
            <div className="text-sm text-gray-600 mt-2">
              Envie textos ou áudios e receba artes em segundos
            </div>
          </div>
        </div>
      </div>

      {/* Add Number Form */}
      {showAddForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Número</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp (com DDD)
              </label>
              <div className="flex">
                <div className="flex-shrink-0 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 flex items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">+55</span>
                  </div>
                </div>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="11 99999-9999"
                  disabled={addMutation.isPending}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enviaremos um código de verificação para este número
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Privacidade Garantida</p>
                  <p>Seu número é usado apenas para envio/recebimento de artes. Não enviamos spam ou compartilhamos seu contato.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={addMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNumber}
                disabled={addMutation.isPending}
                className="btn-primary px-6 py-2"
              >
                {addMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  'Adicionar Número'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Numbers */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-6">Números Conectados</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : numbers?.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum número conectado
            </h4>
            <p className="text-gray-600 mb-6">
              Adicione seu primeiro número de WhatsApp para começar a criar artes
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Número
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {numbers?.map((number) => (
              <div
                key={number.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      number.is_verified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {number.is_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <div className="font-medium text-gray-900">{number.phone_number}</div>
                        {number.is_verified ? (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Verificado
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            Pendente
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                        <span>Recebidas: {number.messages_received}</span>
                        <span>Enviadas: {number.messages_sent}</span>
                        <span>
                          {number.last_used_at 
                            ? `Último uso: ${new Date(number.last_used_at).toLocaleDateString('pt-BR')}`
                            : 'Nunca usado'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!number.is_verified && (
                      <button
                        onClick={() => handleVerifyNumber(number.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium hover:bg-yellow-200"
                      >
                        Verificar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCopyNumber(number.phone_number)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Copiar número"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleSendTestMessage(number.phone_number)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Enviar mensagem de teste"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Remover este número?')) {
                          deleteMutation.mutate(number.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-danger-400 hover:text-danger-600"
                      title="Remover número"
                    >
                      {deleteMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Guide */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <QrCode className="w-5 h-5 text-primary-600 mr-2" />
            Código QR Rápido
          </h3>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 inline-block mb-4">
              {/* Mock QR Code */}
              <div className="w-48 h-48 bg-white rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm text-gray-600">QR Code do NexusArt</div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Escaneie com seu WhatsApp para começar rapidamente
            </p>
            
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir no WhatsApp Web
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Dicas Rápidas</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-green-100 p-1 rounded mr-3 mt-0.5">
                <MessageSquare className="w-3 h-3 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Use áudios:</span> Grave áudios descritivos, o sistema transcreve automaticamente
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-1 rounded mr-3 mt-0.5">
                <Smartphone className="w-3 h-3 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Salve o contato:</span> Salve nosso número nos seus contatos para fácil acesso
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-100 p-1 rounded mr-3 mt-0.5">
                <CheckCircle className="w-3 h-3 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Verifique sempre:</span> Certifique-se que seu número está verificado para receber artes
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Precisa de ajuda?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Entre em contato com nosso suporte pelo WhatsApp
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Olá, preciso de ajuda com o NexusArt`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full btn-primary text-center"
            >
              Falar com Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;