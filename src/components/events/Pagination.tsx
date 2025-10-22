import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalEvents: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalEvents,
  totalPages,
  onPageChange
}: PaginationProps) {
  const showingFrom = (currentPage - 1) * 20 + 1;
  const showingTo = Math.min(currentPage * 20, totalEvents);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* Informações de paginação */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Mostrando {showingFrom} a {showingTo} de {totalEvents} eventos
        </div>
        
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1">
            {/* Botão Anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                let pageNumber: number;
                if (totalPages <= 9) {
                  pageNumber = i + 1;
                } else if (currentPage <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 4) {
                  pageNumber = totalPages - 8 + i;
                } else {
                  pageNumber = currentPage - 4 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            {/* Botão Próximo */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
