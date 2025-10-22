'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { Clock, Users, Calendar, ArrowRight } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  side: 'Home' | 'Away';
  type: string;
  logo?: string;
}

interface Event {
  id: string;
  leagueId: string;
  leagueName: string;
  sportId: string;
  sportName: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  teams: Team[];
  providerId: number;
  name: string;
  startTime: string;
  status: string[];
  isLive: boolean;
  isSuspended: boolean;
  gameStatus: {
    clockRunning: boolean;
    clockDirection: number;
    updateDate: string;
    gameTimeBFFGotAt: number;
  };
  isPostponed: boolean;
  lastUpdate: string;
  markets: unknown[];
  providerEventId: string;
  slug: string;
  leagueSlug: string;
}

interface LeagueEventsProps {
  leagueId: string;
  onEventSelect: (eventId: string) => void;
  selectedEventId?: string;
}

export default function LeagueEvents({ leagueId, onEventSelect, selectedEventId }: LeagueEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leagueId) {
      loadEvents();
    }
  }, [leagueId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carregamento dos dados do league-events.json
      const response = await fetch('/endpoints/fssio/mockReal/league-events.json');
      const data = await response.json();
      
      if (data.data) {
        // Converter array de arrays para objetos Event
        const eventsData: Event[] = data.data.map((event: unknown[]) => ({
          id: event[0],
          leagueId: event[1],
          leagueName: event[2],
          sportId: event[3],
          sportName: event[4],
          countryId: event[5],
          countryCode: event[6],
          countryName: event[7],
          teams: (event[8] as unknown[]).map((team: unknown) => {
            const teamArray = team as unknown[];
            return {
              id: teamArray[0] as string,
              name: typeof teamArray[1] === 'object' ? 
                (teamArray[1] as Record<string, string>)['BR-PT'] || 
                (teamArray[1] as Record<string, string>)['EN'] || 
                Object.values(teamArray[1] as Record<string, string>)[0] : 
                teamArray[1] as string,
              side: teamArray[2] as 'Home' | 'Away',
              type: (teamArray[3] as string) || 'Unknown',
              logo: teamArray[4] as string || null
            };
          }),
          providerId: event[9],
          name: event[10],
          startTime: event[11],
          status: event[12],
          isLive: event[13],
          isSuspended: event[14],
          gameStatus: event[15],
          isPostponed: event[16],
          lastUpdate: event[17],
          markets: event[18],
          providerEventId: event[19],
          slug: event[20],
          leagueSlug: event[21]
        }));
        
        setEvents(eventsData);
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    onEventSelect(eventId);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Eventos da Liga</h3>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
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
            onClick={loadEvents} 
            className="mt-4"
            variant="outline"
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
        <Users className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Eventos da Liga</h3>
        <Badge variant="secondary">{events.length} eventos</Badge>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-700">Nenhum evento encontrado para esta liga.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const { date, time } = formatDateTime(event.startTime);
            
            return (
              <Card 
                key={event.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedEventId === event.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleEventClick(event.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{event.name}</h4>
                    <div className="flex items-center gap-2">
                      {event.isLive && (
                        <Badge variant="destructive" className="text-xs">
                          AO VIVO
                        </Badge>
                      )}
                      {event.isSuspended && (
                        <Badge variant="secondary" className="text-xs">
                          Suspenso
                        </Badge>
                      )}
                      {event.isPostponed && (
                        <Badge variant="outline" className="text-xs">
                          Adiado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-medium text-sm text-gray-800">{event.teams[0]?.name}</div>
                        <div className="text-xs text-gray-600">Casa</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-400">VS</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-sm text-gray-800">{event.teams[1]?.name}</div>
                        <div className="text-xs text-gray-600">Fora</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      <span>Ver detalhes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedEventId && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Evento selecionado:</strong> {events.find(e => e.id === selectedEventId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
