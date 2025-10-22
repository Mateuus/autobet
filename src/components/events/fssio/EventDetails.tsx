'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { Clock, Users, Calendar, ArrowLeft, Trophy, Target } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  side: 'Home' | 'Away';
  type: string;
  logo?: string;
}

interface Market {
  id: string;
  name: string;
  displayName: string;
  description: string;
  outcomes: Outcome[];
  eventId: string;
  leagueId: string;
  sportId: string;
  startTime: string;
  providerId: number;
  lastUpdate: string;
  slug: string;
  leagueSlug: string;
}

interface Outcome {
  id: string;
  name: string;
  displayName: string;
  odds: number;
  isActive: boolean;
  isSuspended: boolean;
  oddsDisplay: string[];
  providerId: number;
  side: string;
  displaySide: string;
}

interface EventData {
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
  gameStatus: unknown;
  isPostponed: boolean;
  lastUpdate: string;
  markets: unknown[];
  providerEventId: string;
  slug: string;
  leagueSlug: string;
}

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carregamento dos dados do event.json
      const response = await fetch('/endpoints/fssio/mockReal/event.json');
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const eventData = data.data[0] as unknown[];
        
        // Converter dados do evento
        const eventInfo: EventData = {
          id: eventData[0] as string,
          leagueId: eventData[1] as string,
          leagueName: eventData[2] as string,
          sportId: eventData[3] as string,
          sportName: eventData[4] as string,
          countryId: eventData[5] as string,
          countryCode: eventData[6] as string,
          countryName: eventData[7] as string,
          teams: (eventData[8] as unknown[]).map((team: unknown) => {
            const teamArray = team as unknown[];
            return {
              id: teamArray[0] as string,
              name: teamArray[1] as string,
              side: teamArray[2] as 'Home' | 'Away',
              type: (teamArray[3] as string) || 'Unknown',
              logo: teamArray[4] as string || undefined
            };
          }),
          providerId: eventData[9] as number,
          name: eventData[10] as string,
          startTime: eventData[11] as string,
          status: eventData[12] as string[],
          isLive: eventData[13] as boolean,
          isSuspended: eventData[14] as boolean,
          gameStatus: eventData[15],
          isPostponed: eventData[16] as boolean,
          lastUpdate: eventData[17] as string,
          markets: eventData[18] as unknown[],
          providerEventId: eventData[19] as string,
          slug: eventData[20] as string,
          leagueSlug: eventData[21] as string
        };
        
        setEvent(eventInfo);
        
        // Converter mercados
        if (eventData[18] && Array.isArray(eventData[18]) && eventData[18].length > 0) {
          const marketsData: Market[] = (eventData[18] as unknown[]).map((market: unknown) => {
            const marketArray = market as unknown[];
            return {
              id: marketArray[0] as string,
              name: marketArray[1] as string,
              displayName: marketArray[2] as string,
              description: marketArray[3] as string,
              outcomes: marketArray[5] ? (marketArray[5] as unknown[]).map((outcome: unknown) => {
                const outcomeArray = outcome as unknown[];
                return {
                  id: outcomeArray[0] as string,
                  name: outcomeArray[1] as string,
                  displayName: outcomeArray[2] as string,
                  odds: outcomeArray[5] as number,
                  isActive: outcomeArray[6] as boolean,
                  isSuspended: outcomeArray[7] as boolean,
                  oddsDisplay: outcomeArray[8] as string[],
                  providerId: outcomeArray[9] as number,
                  side: outcomeArray[10] as string,
                  displaySide: outcomeArray[11] as string
                };
              }) : [],
              eventId: marketArray[6] as string,
              leagueId: marketArray[7] as string,
              sportId: marketArray[8] as string,
              startTime: marketArray[9] as string,
              providerId: marketArray[10] as number,
              lastUpdate: marketArray[11] as string,
              slug: marketArray[12] as string,
              leagueSlug: marketArray[13] as string
            };
          });
          
          setMarkets(marketsData);
        }
      } else {
        setError('Evento não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar detalhes do evento');
      console.error('Erro ao carregar detalhes do evento:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
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
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Detalhes do Evento</h2>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={loadEventDetails} 
              className="mt-4"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Detalhes do Evento</h2>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Evento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { date, time } = formatDateTime(event.startTime as string);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Detalhes do Evento</h2>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-800">{event.name as string}</CardTitle>
            <div className="flex items-center gap-2">
              {(event.isLive as boolean) && (
                <Badge variant="destructive" className="text-xs">
                  AO VIVO
                </Badge>
              )}
              {(event.isSuspended as boolean) && (
                <Badge variant="secondary" className="text-xs">
                  Suspenso
                </Badge>
              )}
              {(event.isPostponed as boolean) && (
                <Badge variant="outline" className="text-xs">
                  Adiado
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-gray-700">{event.leagueName as string}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Teams */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-800">{(event.teams as Team[])[0]?.name}</div>
                <div className="text-sm text-gray-600">Casa</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">VS</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-800">{(event.teams as Team[])[1]?.name}</div>
                <div className="text-sm text-gray-600">Fora</div>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{event.countryName as string}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{event.sportName as string}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Mercados Disponíveis</h3>
          <Badge variant="secondary">{markets.length} mercados</Badge>
        </div>

        {markets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-700">Nenhum mercado disponível para este evento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {markets.map((market) => (
              <Card key={(market as Market).id}>
                <CardHeader>
                  <CardTitle className="text-base text-gray-800">{(market as Market).displayName}</CardTitle>
                  {(market as Market).description && (
                    <CardDescription>{(market as Market).description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  {(market as Market).outcomes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(market as Market).outcomes.map((outcome: Outcome) => (
                        <Button
                          key={outcome.id}
                          variant={outcome.isSuspended ? "secondary" : "outline"}
                          className={`h-12 flex flex-col items-center justify-center ${
                            outcome.isSuspended ? 'opacity-50' : 'hover:bg-blue-50'
                          }`}
                          disabled={outcome.isSuspended}
                        >
                          <div className="font-medium text-sm">{outcome.displayName}</div>
                          <div className="text-xs text-gray-500">
                            {outcome.oddsDisplay?.[1] || outcome.odds?.toFixed(2)}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma opção disponível</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
