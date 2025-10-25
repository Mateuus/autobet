import { ReactNode } from 'react';
import { useBetting } from '@/contexts/BettingContext';
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
  // Novas props para integração com sistema de apostas
  eventData?: {
    id: string;
    name: string;
    startDate: string;
    code?: number;
    competitors?: Array<{ id: string; name: string }>;
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
    desktopOddIds?: string[][];
    mobileOddIds?: string[][];
    isBB: boolean;
    so: number;
    sportMarketId: string;
    id: string;
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
  const { addSelection, isSelected } = useBetting();

  const handleOutcomeClick = (outcome: FssbOutcome) => {
    console.log('🎯 [MarketCard] Clicou na odd FSSIO:', outcome.id, outcome);
    
    // Chamar onClick original se existir
    if (onOutcomeClick) {
      onOutcomeClick(outcome.id);
    }
    
    // Adicionar ao sistema de apostas com dados completos
    addSelection({
      odd: {
        typeId: marketData?.typeId || 1,
        price: outcome.odds,
        isMB: marketData?.isMB || false,
        oddStatus: outcome.isBlocked ? 1 : 0,
        sv: marketData?.sv,
        competitorId: parseInt(eventData?.competitors?.[0]?.id || '0'),
        id: outcome.id, // Usar ID string diretamente
        name: getLocalizedValue(outcome.name),
        lineDir: 1,
        priceDir: 1,
        shouldUpdate: false
      },
      event: {
        id: parseInt(eventData?.id || '0'),
        name: eventData?.name || '',
        isParlay: false,
        rc: false,
        startDate: eventData?.startDate || '',
        code: eventData?.code || 0,
        et: 0
      },
      status: 0,
      isBanker: false,
      isEnabled: !outcome.isBlocked,
      sport: {
        typeId: eventData?.sport?.typeId || 1,
        iconName: eventData?.sport?.iconName || 'soccer',
        hasLiveEvents: eventData?.sport?.hasLiveEvents || false,
        id: eventData?.sport?.id || 1,
        name: eventData?.sport?.name || 'Futebol'
      },
      competitors: eventData?.competitors?.map(c => ({
        id: parseInt(c.id),
        name: c.name
      })) || [],
      championship: {
        hasLiveEvents: eventData?.championship?.hasLiveEvents || false,
        id: eventData?.championship?.id || 0,
        name: eventData?.championship?.name || ''
      },
      category: {
        iso: eventData?.category?.iso || 'BR',
        hasLiveEvents: eventData?.category?.hasLiveEvents || false,
        id: eventData?.category?.id || 1,
        name: eventData?.category?.name || 'Categoria'
      },
      market: {
        shortName: marketData?.shortName || title,
        desktopOddIds: marketData?.desktopOddIds || [[outcome.id]],
        mobileOddIds: marketData?.mobileOddIds || [[outcome.id]],
        isBB: marketData?.isBB || false,
        so: marketData?.so || 0,
        typeId: marketData?.typeId || 1,
        isMB: marketData?.isMB || false,
        sportMarketId: marketData?.sportMarketId || outcome.id,
        sv: marketData?.sv,
        id: marketData?.id || outcome.id,
        name: marketData?.name || title
      },
      widgetInfo: {
        widget: 12,
        page: 3,
        tabIndex: 3,
        tipsterId: null,
        suggestionType: null
      }
    });
  };
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
            outcomes.filter(outcome => !outcome.isSuspense).length === 2 ? 'grid-cols-2' : 
            outcomes.filter(outcome => !outcome.isSuspense).length === 3 ? 'grid-cols-3' : 
            'grid-cols-1'
          }`}>
            {outcomes.filter(outcome => !outcome.isSuspense).map((outcome) => {
              const isBettingSelected = isSelected(outcome.id); // Usar ID string diretamente
              const isSelectedState = selectedOutcomeId === outcome.id || isBettingSelected;
              
              return (
                <button
                  key={outcome.id}
                  onClick={() => handleOutcomeClick(outcome)}
                  disabled={outcome.isBlocked}
                  className={`
                    flex items-center justify-between p-2 rounded border transition-colors relative
                    ${outcome.isBlocked 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }
                    ${isSelectedState && !outcome.isBlocked ? 'bg-red-100 border-red-300 text-red-900' : ''}
                  `}
                >
                  {/* Ícone de cadeado para odds bloqueadas */}
                  {outcome.isBlocked && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className={`text-sm ${outcome.isBlocked ? 'text-gray-400' : (isSelectedState ? 'text-red-900' : 'text-gray-700')}`}>
                    {getLocalizedValue(outcome.name)}
                  </div>
                  <div className={`font-bold ${outcome.isBlocked ? 'text-gray-400' : (isSelectedState ? 'text-red-600' : 'text-blue-500')}`}>
                    {outcome.odds}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
