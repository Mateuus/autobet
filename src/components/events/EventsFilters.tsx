import { useState } from 'react';
import { Search, Filter, Calendar, SortAsc, X } from 'lucide-react';
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

  const handleFilterChange = (key: keyof EventsFilters, value: string | Date | boolean | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({
      searchTerm: '',
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
            placeholder="Digite o nome do evento ou time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-black"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Botão Filtros Avançados */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            showAdvancedFilters
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-200 shadow-sm'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </button>

        {(filters.searchTerm || filters.sortBy !== 'date') && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200 hover:shadow-sm transition-all duration-200 ml-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white text-black"
              >
                <option value="date">Data de início</option>
                <option value="name">Nome do evento</option>
                <option value="league">Nome da liga</option>
              </select>
            </div>

            {/* Filtro por Liga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Liga
              </label>
              <input
                type="text"
                placeholder="Ex: Liga MX, Premier League, Champions League..."
                value={filters.league || ''}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-black"
              />
            </div>

            {/* Filtro por Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data do evento
              </label>
              <input
                type="date"
                value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('date', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
