'use client';

import { Radio, Tv } from 'lucide-react';

export type EventTabType = 'live' | 'prematch';

interface EventsTabsProps {
  activeTab: EventTabType;
  onTabChange: (tab: EventTabType) => void;
  liveEventsCount?: number;
  prematchEventsCount?: number;
  isLiveRefreshing?: boolean;
}

export default function EventsTabs({
  activeTab,
  onTabChange,
  liveEventsCount = 0,
  prematchEventsCount = 0,
  isLiveRefreshing = false
}: EventsTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        {/* Aba AO VIVO */}
        <button
          onClick={() => onTabChange('live')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'live'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            <span>AO VIVO</span>
            <span className={`px-2 py-1 text-xs rounded-full font-bold ${
              activeTab === 'live' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-600'
            }`}>
              {liveEventsCount}
            </span>
            {isLiveRefreshing && activeTab === 'live' && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Aba PRÉ-JOGO */}
        <button
          onClick={() => onTabChange('prematch')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'prematch'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            <span>PRÉ-JOGO</span>
            <span className={`px-2 py-1 text-xs rounded-full font-bold ${
              activeTab === 'prematch' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {prematchEventsCount}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
