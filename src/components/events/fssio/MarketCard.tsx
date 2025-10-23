import { ReactNode } from 'react';
import { FssbOutcome } from '@/services/fssbApi';

// Helper function para extrair valores localizados
const getLocalizedValue = (value: string | Record<string, string> | null | undefined): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Prioridade: BR-PT > EN > primeiro valor disponível
    return value['BR-PT'] || value['EN'] || Object.values(value)[0] || '';
  }
  return '';
};

interface FssioMarketCardProps {
  title: string;
  outcomes: FssbOutcome[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  additionalIcons?: ReactNode;
  children?: ReactNode;
  isBB?: boolean;
  onOutcomeClick?: (outcomeId: string) => void;
  selectedOutcomeId?: string | null;
  // Props para integração com sistema de apostas
  eventData?: {
    id: number;
    name: string;
    startDate: string;
    code?: number;
    competitors?: Array<{ id: number; name: string }>;
    sport?: { typeId: number; iconName: string; hasLiveEvents: boolean; id: number; name: string };
    championship?: { hasLiveEvents: boolean; id: number; name: string };
    category?: { iso: string; hasLiveEvents: boolean; id: number; name: string };
  };
  marketData?: {
    typeId: number;
    isMB: boolean;
    sv?: string;
    shortName?: string;
    name: string;
    desktopOddIds?: number[][];
    mobileOddIds?: number[][];
    isBB: boolean;
    so: number;
    sportMarketId: number;
    id: number;
  };
}

export default function FssioMarketCard({ 
  title, 
  outcomes, 
  isCollapsible = true,
  isCollapsed = false,
  onToggleCollapse,
  additionalIcons,
  children,
  isBB = false,
  onOutcomeClick,
  selectedOutcomeId,
  eventData,
  marketData
}: FssioMarketCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-900 font-medium">{title}</h3>
          {isBB && (
            <div className="bg-gray-800 text-white text-xs font-bold px-1 py-0.5 rounded border border-white">
              PA
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {additionalIcons}
          {isCollapsible && (
            <button 
              onClick={onToggleCollapse}
              className="text-gray-400 hover:text-gray-600"
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          {children}
          <div className={`grid gap-2 ${
            outcomes.length === 2 ? 'grid-cols-2' : 
            outcomes.length === 3 ? 'grid-cols-3' : 
            'grid-cols-1'
          }`}>
            {outcomes.map((outcome) => (
              <button
                key={outcome.id}
                onClick={() => onOutcomeClick?.(outcome.id)}
                disabled={!outcome.isActive}
                className={`
                  flex items-center justify-between p-2 rounded border transition-colors relative
                  ${!outcome.isActive 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }
                  ${selectedOutcomeId === outcome.id && outcome.isActive ? 'bg-red-100 border-red-300 text-red-900' : ''}
                `}
              >
                {/* Ícone de cadeado para odds desativadas */}
                {!outcome.isActive && (
                  <div className="absolute top-1 right-1">
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                <div className={`text-sm ${!outcome.isActive ? 'text-gray-400' : (selectedOutcomeId === outcome.id ? 'text-red-900' : 'text-gray-700')}`}>
                  {getLocalizedValue(outcome.name)}
                </div>
                <div className={`font-bold ${!outcome.isActive ? 'text-gray-400' : (selectedOutcomeId === outcome.id ? 'text-red-600' : 'text-blue-500')}`}>
                  {outcome.odds}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
