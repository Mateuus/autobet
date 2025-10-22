'use client';

import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { List, Trophy, Users, Calendar } from 'lucide-react';
import SportsList from './SportsList';
import LeaguesSidebar from './LeaguesSidebar';
import LeagueEvents from './LeagueEvents';
import EventDetails from './EventDetails';

interface FssioEventsProps {
  className?: string;
}

export default function FssioEvents({ className }: FssioEventsProps) {
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLeaguesSidebarOpen, setIsLeaguesSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'sports' | 'events' | 'details'>('sports');

  const handleSportSelect = (sportId: string) => {
    setSelectedSportId(sportId);
    setSelectedLeagueId('');
    setSelectedEventId('');
    setIsLeaguesSidebarOpen(true);
    setCurrentView('sports');
  };

  const handleLeagueSelect = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setSelectedEventId('');
    setIsLeaguesSidebarOpen(false);
    setCurrentView('events');
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('details');
  };

  const handleBackToEvents = () => {
    setCurrentView('events');
  };

  const handleBackToSports = () => {
    setCurrentView('sports');
    setSelectedLeagueId('');
    setSelectedEventId('');
  };

  const getCurrentSportName = () => {
    // Esta função seria implementada para buscar o nome do esporte baseado no ID
    // Por enquanto, vamos usar um valor fixo
    return selectedSportId === '1' ? 'Futebol' : `Esporte ${selectedSportId}`;
  };

  const getCurrentLeagueName = () => {
    // Esta função seria implementada para buscar o nome da liga baseado no ID
    return selectedLeagueId ? `Liga ${selectedLeagueId}` : '';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Eventos FSSIO</h1>
          <p className="text-gray-700">Explore eventos e apostas disponíveis</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Mock Data
          </Badge>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
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
            <span className="font-medium">{getCurrentLeagueName()}</span>
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
              <div className="flex items-center gap-4 text-sm text-gray-700">
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
    </div>
  );
}
