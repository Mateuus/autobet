'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { Trophy, Calendar, Users } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Esportes Disponíveis</h3>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Esportes Disponíveis</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sports.map((sport) => (
          <Card 
            key={sport.sportId}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSportId === sport.sportId 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSportClick(sport.sportId)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{sport.sportName}</h4>
                <Badge className="text-xs">
                  {sport.numberOfEvents} eventos
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>ID: {sport.sportId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{sport.numberOfEvents} jogos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSportId && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Esporte selecionado:</strong> {sports.find(s => s.sportId === selectedSportId)?.sportName}
          </p>
        </div>
      )}
    </div>
  );
}
