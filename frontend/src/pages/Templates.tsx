import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Download,
  Plus,
  Palette,
  Sparkles,
  Check,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  style: string;
  preview_url: string;
  is_premium: boolean;
  is_favorite: boolean;
  usage_count: number;
  average_rating: number | null;
}

const Templates: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      // Mock data
      return [
        {
          id: 1,
          name: 'Promoção Restaurante',
          description: 'Template elegante para promoções de comida',
          category: 'restaurant',
          style: 'elegant',
          preview_url: 'https://placehold.co/400x400/FF6B35/FFFFFF?text=Restaurante',
          is_premium: false,
          is_favorite: true,
          usage_count: 45,
          average_rating: 4.8
        },
        {
          id: 2,
          name: 'Oferta Supermercado',
          description: 'Template vibrante para ofertas de mercado',
          category: 'supermarket',
          style: 'bold',
          preview_url: 'https://placehold.co/400x400/2A9D8F/FFFFFF?text=Supermercado',
          is_premium: false,
          is_favorite: false,
          usage_count: 32,
          average_rating: 4.5
        },
        {
          id: 3,
          name: 'Moda Fashion',
          description: 'Template moderno para coleções de moda',
          category: 'clothing',
          style: 'modern',
          preview_url: 'https://placehold.co/400x400/E63946/FFFFFF?text=Moda',
          is_premium: true,
          is_favorite: false,
          usage_count: 28,
          average_rating: 4.9
        },
        {
          id: 4,
          name: 'Beleza Premium',
          description: 'Template sofisticado para serviços de beleza',
          category: 'beauty',
          style: 'elegant',
          preview_url: 'https://placehold.co/400x400/FFAFCC/FFFFFF?text=Beleza',
          is_premium: true,
          is_favorite: true,
          usage_count: 19,
          average_rating: 4.7
        },
        {
          id: 5,
          name: 'Serviços Profissionais',
          description: 'Template clean para prestação de serviços',
          category: 'services',
          style: 'minimal',
          preview_url: 'https://placehold.co/400x400/3A86FF/FFFFFF?text=Serviços',
          is_premium: false,
          is_favorite: false,
          usage_count: 37,
          average_rating: 4.3
        },
        {
          id: 6,
          name: 'Divertido Infantil',
          description: 'Template colorido para produtos infantis',
          category: 'other',
          style: 'fun',
          preview_url: 'https://placehold.co/400x400/FF9E00/FFFFFF?text=Infantil',
          is_premium: false,
          is_favorite: false,
          usage_count: 15,
          average_rating: 4.6
        }
      ];
    }
  });

  const categories = [
    { id: 'all', name: 'Todos', count: templates?.length || 0 },
    { id: 'restaurant', name: 'Restaurante', count: templates?.filter(t => t.category === 'restaurant').length || 0 },
    { id: 'supermarket', name: 'Supermercado', count: templates?.filter(t => t.category === 'supermarket').length || 0 },
    { id: 'clothing', name: 'Moda', count: templates?.filter(t => t.category === 'clothing').length || 0 },
    { id: 'beauty', name: 'Beleza', count: templates?.filter(t => t.category === 'beauty').length || 0 },
    { id: 'services', name: 'Serviços', count: templates?.filter(t => t.category === 'services').length || 0 },
    { id: 'other', name: 'Outros', count: templates?.filter(t => t.category === 'other').length || 0 }
  ];

  const styles = [
    { id: 'all', name: 'Todos' },
    { id: 'modern', name: 'Moderno' },
    { id: 'elegant', name: 'Elegante' },
    { id: 'bold', name: 'Chamativo' },
    { id: 'minimal', name: 'Minimalista' },
    { id: 'fun', name: 'Divertido' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || template.style === selectedStyle;
    
    return matchesSearch && matchesCategory && matchesStyle;
  });

  const handleUseTemplate = (template: Template) => {
    toast.success(`Template "${template.name}" selecionado!`);
    // Navigate to generation page with template
  };

  const handleFavorite = (templateId: number) => {
    toast.success('Template adicionado aos favoritos');
    // Implement favorite logic
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">
            Escolha um template ou crie o seu próprio estilo
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Template
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-base pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Style Filter */}
            <div className="relative">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="input-base pr-10"
              >
                {styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
              <Palette className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${
                  viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-600 border-r border-primary-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-600 border-l border-primary-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates?.length === 0 ? (
        <div className="card text-center py-12">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente buscar com outros termos'
              : 'Crie seu primeiro template personalizado'
            }
          </p>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Template
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates?.map((template) => (
            <div
              key={template.id}
              className="card-hover group"
            >
              {/* Preview Image */}
              <div className="h-48 rounded-lg overflow-hidden mb-4 relative">
                <img
                  src={template.preview_url}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Premium Badge */}
                {template.is_premium && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </div>
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => handleFavorite(template.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                >
                  <Star className={`w-5 h-5 ${
                    template.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`} />
                </button>
                
                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-3 bg-white rounded-full hover:bg-gray-100"
                    title="Visualizar"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                    title="Usar template"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {template.average_rating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {template.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {template.style}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {template.usage_count} usos
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full btn-primary py-2"
                  >
                    Usar Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estilo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliação
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates?.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-gray-100 mr-4 overflow-hidden flex-shrink-0">
                        <img
                          src={template.preview_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {template.name}
                          {template.is_premium && (
                            <Sparkles className="w-4 h-4 text-yellow-500 inline-block ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {template.style}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {template.usage_count}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{template.average_rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFavorite(template.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Favoritar"
                      >
                        <Star className={`w-4 h-4 ${
                          template.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
                        }`} />
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Usar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h2>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Preview Image */}
                <div>
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img
                      src={previewTemplate.preview_url}
                      alt={previewTemplate.name}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Preview do template
                  </div>
                </div>
                
                {/* Template Details */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                      <p className="text-gray-600">{previewTemplate.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Detalhes</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Categoria</div>
                          <div className="font-medium">{previewTemplate.category}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Estilo</div>
                          <div className="font-medium">{previewTemplate.style}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Usos</div>
                          <div className="font-medium">{previewTemplate.usage_count}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Avaliação</div>
                          <div className="font-medium flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            {previewTemplate.average_rating?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Como usar</h3>
                      <ol className="text-gray-600 space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                          Selecione este template
                        </li>
                        <li className="flex items-start">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                          Digite sua promoção
                        </li>
                        <li className="flex items-start">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                          Personalize cores e texto
                        </li>
                        <li className="flex items-start">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                          Gere e compartilhe!
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        {previewTemplate.is_premium ? (
                          <div className="flex items-center text-yellow-600">
                            <Sparkles className="w-5 h-5 mr-2" />
                            <span className="font-medium">Template Premium</span>
                          </div>
                        ) : (
                          <div className="text-green-600 font-medium">Template Gratuito</div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setPreviewTemplate(null)}
                          className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            handleUseTemplate(previewTemplate);
                            setPreviewTemplate(null);
                          }}
                          className="btn-primary px-6 py-2"
                        >
                          Usar Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;