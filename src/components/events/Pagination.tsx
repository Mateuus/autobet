import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalEvents: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalEvents,
  pageSize,
  hasMore,
  loading,
  onLoadMore,
  onPageChange
}: PaginationProps) {
  const totalPages = Math.ceil(totalEvents / pageSize);
  const showingFrom = (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalEvents);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* Informações de paginação */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Mostrando {showingFrom} a {showingTo} de {totalEvents} eventos
        </div>
        
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
              {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Botão Carregar Mais */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Carregar Mais Eventos
              </>
            )}
          </button>
        </div>
      )}

      {/* Indicador de fim */}
      {!hasMore && totalEvents > pageSize && (
        <div className="text-center text-gray-500 text-sm">
          Todos os eventos foram carregados
        </div>
      )}
    </div>
  );
}
