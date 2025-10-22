'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { ScrollArea } from '../../ui/scroll-area';
import { X, Trophy, MapPin, Calendar } from 'lucide-react';

interface League {
  id: string;
  name: string;
  isPopular: boolean;
  priority: number;
  slug: string;
  country: string;
  sport: string;
  sportId: string;
  providerId: number;
  providerLeagueId: string;
}

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
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carregamento dos dados do leagues.json
      const response = await fetch('/endpoints/fssio/mockReal/leagues.json');
      const data = await response.json();
      
      if (data.data) {
        // Converter array de arrays para objetos League
        const leaguesData: League[] = data.data.map((league: unknown[]) => ({
          id: league[0] as string,
          name: league[1] as string,
          isPopular: league[2] as boolean,
          priority: league[3] as number,
          slug: league[4] as string,
          country: league[5] as string,
          sport: league[6] as string,
          sportId: league[7] as string,
          providerId: league[8] as number,
          providerLeagueId: league[9] as string
        }));
        
        // Filtrar apenas ligas do esporte selecionado (Futebol = "1")
        const filteredLeagues = leaguesData.filter(league => 
          league.sport.toLowerCase() === 'futebol' || league.sportId === sportId
        );
        setLeagues(filteredLeagues);
      } else {
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

  const handleLeagueClick = (leagueId: string) => {
    onLeagueSelect(leagueId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 z-50 bg-white w-80 h-full shadow-xl border-r border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Ligas Disponíveis</h2>
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

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-3">
          {loading ? (
            <>
              {[...Array(10)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={loadLeagues} 
                  className="mt-4"
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          ) : (
            leagues.map((league) => (
              <Card 
                key={league.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedLeagueId === league.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleLeagueClick(league.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm leading-tight">
                      {league.name}
                    </h4>
                    {league.isPopular && (
                      <Badge variant="default" className="text-xs ml-2">
                        Popular
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-600" />
                      <span>{league.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-600" />
                      <span>ID: {league.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {selectedLeagueId && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <p className="text-blue-800 text-sm">
            <strong>Liga selecionada:</strong> {leagues.find(l => l.id === selectedLeagueId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}