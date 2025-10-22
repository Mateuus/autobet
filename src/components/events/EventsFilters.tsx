import { useState } from 'react';
import { Search, Filter, Calendar, SortAsc } from 'lucide-react';
import { EventsFilters } from '@/hooks/useEvents';

interface EventsFiltersProps {
  filters: EventsFilters;
  onFiltersChange: (filters: EventsFilters) => void;
  onSearch: (searchTerm: string) => void;
}

export default function EventsFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onSearch 
}: EventsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleFilterChange = (key: keyof EventsFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({
      searchTerm: '',
      status: 'all',
      sortBy: 'date'
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
      {/* Barra de Pesquisa */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('status', 'all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.status === 'all' || !filters.status
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => handleFilterChange('status', 'live')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.status === 'live'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          🔴 Ao Vivo
        </button>
        <button
          onClick={() => handleFilterChange('status', 'upcoming')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.status === 'upcoming'
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          ⏰ Próximos
        </button>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>

        {(filters.searchTerm || filters.status !== 'all' || filters.sortBy !== 'date') && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SortAsc className="w-4 h-4 inline mr-1" />
                Ordenar por
              </label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Data</option>
                <option value="name">Nome</option>
                <option value="league">Liga</option>
              </select>
            </div>

            {/* Filtro por Liga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liga
              </label>
              <input
                type="text"
                placeholder="Ex: Liga MX, Premier League..."
                value={filters.league || ''}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data
              </label>
              <input
                type="date"
                value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('date', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
