import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, MessageSquare } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="relative">
          <div className="text-9xl font-bold text-gray-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-gray-900">404</div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Página não encontrada
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            A página que você está procurando pode ter sido removida ou está temporariamente indisponível.
          </p>

          {/* Suggestions */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">O que você pode fazer:</h3>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Home className="w-5 h-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Ir para a página inicial</div>
                  <div className="text-sm text-gray-600">Volte para o dashboard principal</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 ml-auto rotate-180" />
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Search className="w-5 h-5 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Buscar no dashboard</div>
                  <div className="text-sm text-gray-600">Encontre o que você precisa</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 ml-auto rotate-180" />
              </Link>

              <a
                href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Falar com suporte</div>
                  <div className="text-sm text-gray-600">Obtenha ajuda via WhatsApp</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 ml-auto rotate-180" />
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-xl hover:opacity-90"
            >
              <Home className="w-5 h-5 mr-2" />
              Página Inicial
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Se você acredita que isso é um erro, entre em contato com nosso suporte.
          </p>
          <div className="mt-4">
            <Link to="/help" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              Centro de Ajuda →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;