'use client';

import { useState, useEffect } from 'react';
import { Calendar, Star, RefreshCw, AlertCircle } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Events List */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Carregando eventos...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-red-800 font-medium mb-2">Erro ao carregar eventos</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadEvents}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Events List */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500 text-sm">Não há eventos disponíveis para esta liga no momento.</p>
          </div>
        )}

        {/* Events */}
        {!loading && !error && events.map((event) => {
          // Converter data ISO para formato brasileiro
          const eventDate = new Date(event.startTime);
          const dateStr = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
          const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;
          
          return (
            <div 
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className={`bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm ${
                selectedEventId === event.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
              }`}
            >
              {/* Event Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{dateStr} • {timeStr}</span>
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  {event.isLive ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          AO VIVO
                        </span>
                        {event.gameStatus && (
                          <span className="text-green-600 text-sm font-mono font-bold">
                            {event.gameStatus.clockRunning ? '90+' : '45+'}
                          </span>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <span className="text-blue-600 text-sm font-medium">PRÉ-JOGO</span>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{event.name}</div>
                  {/* Mostrar placar para eventos ao vivo */}
                  {event.isLive && event.gameStatus && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600 font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold min-w-[30px] text-center">
                          {event.gameStatus.clockRunning ? '90+' : '45+'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">ID: {event.id}</span>
                    <span className="text-sm text-gray-500">Código: {event.providerEventId}</span>
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