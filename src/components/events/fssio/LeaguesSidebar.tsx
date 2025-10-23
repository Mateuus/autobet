'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { ScrollArea } from '../../ui/scroll-area';
import { X, Trophy, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { FssbLeague } from '../../../services/fssbApi';

interface LeaguesSidebarProps {
  sportId: string;
  isOpen: boolean;
  onClose: () => void;
  onLeagueSelect: (leagueId: string) => void;
  selectedLeagueId?: string;
}

export default function LeaguesSidebar({ 
  sportId, 
  isOpen, 
  onClose, 
  onLeagueSelect, 
  selectedLeagueId 
}: LeaguesSidebarProps) {
  const [leagues, setLeagues] = useState<FssbLeague[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<FssbLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o endpoint local que consome o fssbApi
      const response = await fetch(`/api/fssb/leagues?sportId=${sportId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data) {
        console.log('🏆 [LeaguesSidebar] Dados recebidos:', data.data.slice(0, 3)); // Debug: mostrar primeiras 3 ligas
        console.log('🏆 [LeaguesSidebar] Total de ligas:', data.data.length);
        console.log('🏆 [LeaguesSidebar] Primeira liga completa:', data.data[0]);
        
        // Usar diretamente os dados já mapeados do endpoint
        setLeagues(data.data);
        setFilteredLeagues(data.data);
      } else {
        console.error('❌ [LeaguesSidebar] Dados inválidos:', data);
        setError('Formato de dados inválido');
      }
    } catch (err) {
      setError('Erro ao carregar ligas');
      console.error('Erro ao carregar ligas:', err);
    } finally {
      setLoading(false);
    }
  }, [sportId]);

  useEffect(() => {
    if (isOpen && sportId) {
      loadLeagues();
    }
  }, [isOpen, sportId, loadLeagues]);

  // Filtrar ligas por termo de busca
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = leagues.filter(league =>
        league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        league.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues(leagues);
    }
  }, [searchTerm, leagues]);

  const handleLeagueClick = (leagueId: string) => {
    onLeagueSelect(leagueId);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 z-50 bg-white w-80 h-full shadow-xl border-r border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Ligas Disponíveis</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar ligas..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-3 border border-gray-200 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-red-800 font-medium mb-2">Erro ao carregar ligas</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button 
                onClick={loadLeagues} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          ) : filteredLeagues.length === 0 ? (
            <div className="p-6 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-600 font-medium mb-2">Nenhuma liga encontrada</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Tente outro termo de busca' : 'Não há ligas disponíveis para este esporte.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLeagues.map((league, index) => (
                <div 
                  key={league.id || `league-${index}`}
                  onClick={() => handleLeagueClick(league.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedLeagueId === league.id 
                      ? 'bg-blue-50 border-blue-300 text-blue-900' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{league.name}</h4>
                        {league.isPopular && (
                          <Trophy className="h-3 w-3 text-yellow-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{league.country}</span>
                        {/*<span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">ID: {league.id}</span>*/}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedLeagueId && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <p className="text-blue-900 text-sm font-medium">
            <strong>Liga selecionada:</strong> {leagues.find(l => l.id === selectedLeagueId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}