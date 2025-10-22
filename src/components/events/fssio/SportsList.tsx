'use client';

import { useState, useEffect } from 'react';
import { Calendar, Star, RefreshCw, AlertCircle } from 'lucide-react';

interface Sport {
  sportId: string;
  sportName: string;
  numberOfEvents: number;
}

interface SportsListProps {
  onSportSelect: (sportId: string) => void;
  selectedSportId?: string;
}

export default function SportsList({ onSportSelect, selectedSportId }: SportsListProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSports = async () => {
      try {
        setLoading(true);
        // Simular carregamento dos dados do initial.json
        const response = await fetch('/endpoints/fssio/mockReal/initial.json');
        const data = await response.json();
        
        if (data.sports) {
          setSports(data.sports);
        } else {
          setError('Formato de dados inválido');
        }
      } catch (err) {
        setError('Erro ao carregar esportes');
        console.error('Erro ao carregar esportes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  const handleSportClick = (sportId: string) => {
    onSportSelect(sportId);
  };

  return (
    <div className="space-y-6">
      {/* Sports List */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Carregando esportes...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-red-800 font-medium mb-2">Erro ao carregar esportes</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Sports List */}
        {!loading && !error && sports.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 font-medium mb-2">Nenhum esporte encontrado</h3>
            <p className="text-gray-500 text-sm">Não há esportes disponíveis no momento.</p>
          </div>
        )}

        {/* Sports */}
        {!loading && !error && sports.map((sport) => {
          return (
            <div 
              key={sport.sportId}
              onClick={() => handleSportClick(sport.sportId)}
              className={`bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm ${
                selectedSportId === sport.sportId 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
              }`}
            >
              {/* Sport Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">ID: {sport.sportId}</span>
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-sm font-medium">PRÉ-JOGO</span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>

              {/* Sport Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{sport.sportName}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600 font-medium">Eventos:</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold min-w-[30px] text-center">
                        {sport.numberOfEvents}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">ID: {sport.sportId}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}