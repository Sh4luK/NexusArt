import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Share2, 
  Trash2,
  MoreVertical,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Generation {
  id: number;
  name: string;
  description: string;
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
  image_url?: string;
  prompt: string;
  template_id?: number;
  downloads: number;
  shares: number;
}

const Gallery: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ['gallery-generations'],
    queryFn: async () => {
      // Mock data
      return [
        {
          id: 1,
          name: 'Promoção Pizza Especial',
          description: 'Arte para promoção de pizza',
          created_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          prompt: 'Pizza grande + refrigerante por R$ 39,90',
          downloads: 5,
          shares: 3,
        },
        {
          id: 2,
          name: 'Oferta Camisetas',
          description: 'Promoção de verão',
          created_at: '2024-01-14T15:45:00Z',
          status: 'completed',
          prompt: 'Todas as camisetas com 30% de desconto',
          downloads: 8,
          shares: 5,
        },
        {
          id: 3,
          name: 'Cardápio Semanal',
          description: 'Cardápio completo da semana',
          created_at: '2024-01-13T09:15:00Z',
          status: 'completed',
          prompt: 'Cardápio da semana com preços especiais',
          downloads: 12,
          shares: 7,
        },
        {
          id: 4,
          name: 'Black Friday',
          description: 'Promoção Black Friday',
          created_at: '2024-01-12T14:20:00Z',
          status: 'processing',
          prompt: 'Ofertas especiais de Black Friday',
          downloads: 0,
          shares: 0,
        },
        {
          id: 5,
          name: 'Natal 2023',
          description: 'Promoção de Natal',
          created_at: '2024-01-11T11:10:00Z',
          status: 'failed',
          prompt: 'Promoções especiais de Natal',
          downloads: 0,
          shares: 0,
        },
      ];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return ids;
    },
    onSuccess: (ids) => {
      queryClient.setQueryData<Generation[]>(['gallery-generations'], (old) => 
        old?.filter(g => !ids.includes(g.id)) || []
      );
      setSelectedItems([]);
      toast.success(`${ids.length} item(s) excluído(s)`);
    },
    onError: () => {
      toast.error('Erro ao excluir itens');
    },
  });

  const filters = [
    { id: 'all', label: 'Todos', count: generations?.length || 0 },
    { id: 'completed', label: 'Concluídos', count: generations?.filter(g => g.status === 'completed').length || 0 },
    { id: 'processing', label: 'Processando', count: generations?.filter(g => g.status === 'processing').length || 0 },
    { id: 'failed', label: 'Falhou', count: generations?.filter(g => g.status === 'failed').length || 0 },
  ];

  const handleSelectAll = () => {
    if (selectedItems.length === filteredGenerations?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredGenerations?.map(g => g.id) || []);
    }
  };

  const handleDownload = (id: number) => {
    toast.success('Download iniciado');
    // Implement download logic
  };

  const handleShare = (id: number) => {
    toast.success('Link copiado para compartilhamento');
    // Implement share logic
  };

  const handleDelete = () => {
    if (selectedItems.length > 0) {
      if (window.confirm(`Excluir ${selectedItems.length} item(s)?`)) {
        deleteMutation.mutate(selectedItems);
      }
    }
  };

  const filteredGenerations = generations?.filter(generation => {
    const matchesSearch = generation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         generation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         generation.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || generation.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: Generation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (status: Generation['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
          <p className="text-gray-600 mt-1">
            {generations?.length || 0} artes criadas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            <ImageIcon className="w-4 h-4 mr-2" />
            Nova Arte
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
                placeholder="Buscar artes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
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

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input-base pr-10"
              >
                {filters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label} ({filter.count})
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredGenerations?.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <span className="ml-3 font-medium text-gray-900">
                  {selectedItems.length} item(s) selecionado(s)
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    selectedItems.forEach(handleDownload);
                  }}
                  className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Baixar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center text-sm text-danger-600 hover:text-danger-700"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger-600 mr-1"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredGenerations?.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma arte encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente buscar com outros termos'
              : 'Comece criando sua primeira arte promocional'
            }
          </p>
          <button className="btn-primary">
            <ImageIcon className="w-4 h-4 mr-2" />
            Criar Primeira Arte
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations?.map((generation) => (
            <div
              key={generation.id}
              className="card-hover group"
            >
              {/* Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(generation.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, generation.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== generation.id));
                    }
                  }}
                  className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
              </div>

              {/* Image/Preview */}
              <div className="h-48 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-primary-300" />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {getStatusIcon(generation.status)}
                    <span className="ml-1">{getStatusText(generation.status)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {generation.name}
                  </h3>
                  <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {generation.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(generation.created_at)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {generation.downloads}
                    </span>
                    <span className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      {generation.shares}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(generation.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </button>
                  <button
                    onClick={() => handleShare(generation.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartilhar
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
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredGenerations?.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arte
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGenerations?.map((generation) => (
                <tr key={generation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(generation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, generation.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== generation.id));
                        }
                      }}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mr-3">
                        <ImageIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{generation.name}</div>
                        <div className="text-sm text-gray-500">{generation.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(generation.status)}
                      <span className="ml-2 text-sm">{getStatusText(generation.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {generation.downloads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(generation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDownload(generation.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(generation.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Excluir esta arte?')) {
                            deleteMutation.mutate([generation.id]);
                          }
                        }}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredGenerations && filteredGenerations.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a{' '}
            <span className="font-medium">{filteredGenerations.length}</span> de{' '}
            <span className="font-medium">{filteredGenerations.length}</span> resultados
          </div>
          {/* Pagination buttons would go here */}
        </div>
      )}
    </div>
  );
};

export default Gallery;