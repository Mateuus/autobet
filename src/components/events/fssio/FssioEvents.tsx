'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { List, Trophy, Users, Calendar } from 'lucide-react';
import SportsList from './SportsList';
import LeaguesSidebar from './LeaguesSidebar';
import LeagueEvents from './LeagueEvents';
import EventDetails from './EventDetails';
import FloatingBettingButton from '../../betting/FloatingBettingButton';
import BettingSlipModal from '../../betting/BettingSlipModal';
import { useBetting } from '@/contexts/BettingContext';

interface FssioEventsProps {
  className?: string;
}

interface League {
  id: string;
  name: string;
}

export default function FssioEvents({ className }: FssioEventsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, setIsOpen } = useBetting();
  
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>('');
  const [isLeaguesSidebarOpen, setIsLeaguesSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'sports' | 'events' | 'details'>('sports');

  // Sincronizar com URL parameters
  useEffect(() => {
    const sportId = searchParams.get('sportid') || '';
    const leagueId = searchParams.get('league') || '';
    const eventId = searchParams.get('event') || '';

    setSelectedSportId(sportId);
    setSelectedLeagueId(leagueId);
    setSelectedEventId(eventId);

    // Determinar view baseado nos parâmetros
    if (eventId) {
      setCurrentView('details');
    } else if (leagueId) {
      setCurrentView('events');
      setIsLeaguesSidebarOpen(false);
    } else if (sportId) {
      setCurrentView('sports');
      setIsLeaguesSidebarOpen(true);
    } else {
      setCurrentView('sports');
      setIsLeaguesSidebarOpen(false);
    }
  }, [searchParams]);

  // Buscar nome da liga quando o leagueId mudar
  useEffect(() => {
    const fetchLeagueName = async () => {
      if (selectedLeagueId && selectedSportId) {
        try {
          const response = await fetch(`/api/fssb/leagues?sportId=${selectedSportId}`);
          if (response.ok) {
            const data = await response.json();
            const league = data.data.find((l: League) => l.id === selectedLeagueId);
            if (league) {
              setSelectedLeagueName(league.name);
            } else {
              setSelectedLeagueName(`Liga ${selectedLeagueId}`);
            }
          } else {
            setSelectedLeagueName(`Liga ${selectedLeagueId}`);
          }
        } catch (error) {
          console.error('Erro ao buscar nome da liga:', error);
          setSelectedLeagueName(`Liga ${selectedLeagueId}`);
        }
      } else {
        setSelectedLeagueName('');
      }
    };

    fetchLeagueName();
  }, [selectedLeagueId, selectedSportId]);

  const updateURL = (sportId?: string, leagueId?: string, eventId?: string) => {
    const params = new URLSearchParams();
    
    if (sportId) params.set('sportid', sportId);
    if (leagueId) params.set('league', leagueId);
    if (eventId) params.set('event', eventId);
    
    const queryString = params.toString();
    const newURL = queryString ? `/events?${queryString}` : '/events';
    
    router.push(newURL);
  };

  const handleSportSelect = (sportId: string) => {
    updateURL(sportId);
    setIsLeaguesSidebarOpen(true);
  };

  const handleLeagueSelect = (leagueId: string) => {
    updateURL(selectedSportId, leagueId);
    setIsLeaguesSidebarOpen(false);
  };

  const handleEventSelect = (eventId: string) => {
    updateURL(selectedSportId, selectedLeagueId, eventId);
  };

  const handleBackToEvents = () => {
    updateURL(selectedSportId, selectedLeagueId);
  };

  const handleBackToSports = () => {
    updateURL(selectedSportId);
  };

  const getCurrentSportName = () => {
    // Esta função seria implementada para buscar o nome do esporte baseado no ID
    // Por enquanto, vamos usar um valor fixo
    return selectedSportId === '1' ? 'Futebol' : `Esporte ${selectedSportId}`;
  };

  const getCurrentLeagueName = () => {
    return selectedLeagueName || (selectedLeagueId ? `Liga ${selectedLeagueId}` : '');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToSports}
          className="h-6 px-2"
        >
          <List className="h-3 w-3 mr-1" />
          Esportes
        </Button>
        
        {selectedSportId && (
          <>
            <span>/</span>
            <span className="font-medium">{getCurrentSportName()}</span>
          </>
        )}
        
        {selectedLeagueId && (
          <>
            <span>/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateURL(selectedSportId, selectedLeagueId)}
              className="h-6 px-2 font-medium text-gray-600 hover:text-gray-900"
            >
              {getCurrentLeagueName()}
            </Button>
          </>
        )}
        
        {selectedEventId && (
          <>
            <span>/</span>
            <span className="font-medium">Detalhes</span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {currentView === 'sports' && (
          <SportsList
            onSportSelect={handleSportSelect}
            selectedSportId={selectedSportId}
          />
        )}

        {currentView === 'events' && selectedLeagueId && (
          <LeagueEvents
            leagueId={selectedLeagueId}
            onEventSelect={handleEventSelect}
            selectedEventId={selectedEventId}
          />
        )}

        {currentView === 'details' && selectedEventId && (
          <EventDetails
            eventId={selectedEventId}
            onBack={handleBackToEvents}
          />
        )}

        {/* Leagues Sidebar */}
        <LeaguesSidebar
          sportId={selectedSportId}
          isOpen={isLeaguesSidebarOpen}
          onClose={() => setIsLeaguesSidebarOpen(false)}
          onLeagueSelect={handleLeagueSelect}
          selectedLeagueId={selectedLeagueId}
        />
      </div>

      {/* Quick Actions */}
      {currentView !== 'sports' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Esporte: {getCurrentSportName()}</span>
                </div>
                {selectedLeagueId && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Liga: {getCurrentLeagueName()}</span>
                  </div>
                )}
                {selectedEventId && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Evento selecionado</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {currentView === 'events' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLeaguesSidebarOpen(true)}
                  >
                    Trocar Liga
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToSports}
                >
                  Voltar aos Esportes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema de Apostas */}
      <FloatingBettingButton />
      <BettingSlipModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}