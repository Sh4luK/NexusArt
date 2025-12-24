import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const features = [
    'Crie artes em segundos via WhatsApp',
    'Sem necessidade de conhecimento em design',
    'Preços acessíveis para pequenos negócios',
    'Funciona 100% pelo celular',
    'Suporte em português',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">NexusArt</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left side - Form */}
          <div className="mb-12 lg:mb-0">
            {children}
          </div>

          {/* Right side - Info */}
          <div className="lg:pl-12">
            <div className="bg-white rounded-2xl shadow-soft p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Revolucione as Promoções do Seu Negócio
              </h2>
              
              <p className="text-gray-600 text-lg mb-8">
                NexusArt torna fácil criar artes profissionais direto pelo WhatsApp. 
                Ideal para pequenos comerciantes que querem vender mais sem complicação.
              </p>

              <div className="space-y-4 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-success-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Testimonials */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">JS</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">João Silva</div>
                    <div className="text-sm text-gray-600">Restaurante do João</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Antes gastava horas fazendo artes. Agora, com o NexusArt, 
                  envio um áudio pelo WhatsApp e em segundos tenho uma arte pronta. 
                  Meus clientes adoram!"
                </p>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">5.000+</div>
                  <div className="text-sm text-gray-600">Artes geradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">30s</div>
                  <div className="text-sm text-gray-600">Tempo médio</div>
                </div>
              </div>
            </div>

            {/* Pricing info */}
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">7 Dias Grátis</h3>
              <p className="text-green-700 text-sm">
                Teste todas as funcionalidades por 7 dias. Não precisa de cartão de crédito!
                Após o período, escolha entre nossos planos a partir de R$ 49,90/mês.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-6">
              <details className="group mb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-white rounded-lg hover:bg-gray-50">
                  <span className="font-medium text-gray-700">Como funciona?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="p-3 text-gray-600 text-sm">
                  1. Conecte seu WhatsApp<br/>
                  2. Envie texto ou áudio com sua promoção<br/>
                  3. Receba a arte pronta em segundos<br/>
                  4. Compartilhe com seus clientes
                </div>
              </details>
              
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-white rounded-lg hover:bg-gray-50">
                  <span className="font-medium text-gray-700">Preciso de conhecimento técnico?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="p-3 text-gray-600 text-sm">
                  Não! O NexusArt foi criado para ser simples. 
                  Basta saber usar o WhatsApp. Todo o processo de design é feito automaticamente pela inteligência artificial.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} NexusArt. Todos os direitos reservados.</p>
            <div className="mt-2">
              <Link to="/terms" className="hover:text-gray-700 mx-2">Termos</Link>
              <Link to="/privacy" className="hover:text-gray-700 mx-2">Privacidade</Link>
              <Link to="/contact" className="hover:text-gray-700 mx-2">Contato</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;