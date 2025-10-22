'use client';

import { useBetting } from '@/contexts/BettingContext';

interface OddsButtonProps {
  label: string;
  odds: number;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  oddStatus?: number;
  // Novas props para integração com sistema de apostas
  oddId?: number;
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

export default function OddsButton({ 
  label, 
  odds, 
  onClick, 
  className = "",
  isSelected = false,
  isDisabled = false,
  oddStatus = 0,
  oddId,
  eventData,
  marketData
}: OddsButtonProps) {
  const { addSelection, isSelected: isBettingSelected } = useBetting();
  const isLocked = oddStatus !== 0;
  const isButtonDisabled = isDisabled || isLocked;
  
  // Usar seleção do sistema de apostas se disponível, senão usar prop
  const finalIsSelected = oddId ? isBettingSelected(oddId) : isSelected;

  const handleClick = () => {
    // Chamar onClick original se existir
    if (onClick) {
      onClick();
    }
    
    // Adicionar ao sistema de apostas se temos os dados necessários
    if (oddId && eventData && marketData) {
      const selection = {
        odd: {
          typeId: marketData.typeId || 1,
          price: odds,
          isMB: marketData.isMB || false,
          oddStatus: oddStatus,
          sv: marketData.sv,
          competitorId: eventData.competitors?.[0]?.id || 0,
          id: oddId,
          name: label,
          lineDir: 1,
          priceDir: 1,
          shouldUpdate: false
        },
        event: {
          id: eventData.id,
          name: eventData.name,
          isParlay: false,
          rc: false,
          startDate: eventData.startDate,
          code: eventData.code || 0,
          et: 0
        },
        status: 0,
        isBanker: false,
        isEnabled: true,
        sport: {
          typeId: eventData.sport?.typeId || 1,
          iconName: eventData.sport?.iconName || 'soccer',
          hasLiveEvents: eventData.sport?.hasLiveEvents || false,
          id: eventData.sport?.id || 1,
          name: eventData.sport?.name || 'Futebol'
        },
        competitors: eventData.competitors || [],
        championship: {
          hasLiveEvents: eventData.championship?.hasLiveEvents || false,
          id: eventData.championship?.id || 0,
          name: eventData.championship?.name || ''
        },
        category: {
          iso: eventData.category?.iso || '',
          hasLiveEvents: eventData.category?.hasLiveEvents || false,
          id: eventData.category?.id || 0,
          name: eventData.category?.name || ''
        },
        market: {
          shortName: marketData.shortName || marketData.name,
          desktopOddIds: marketData.desktopOddIds || [],
          mobileOddIds: marketData.mobileOddIds || [],
          isBB: marketData.isBB || false,
          so: marketData.so || 0,
          typeId: marketData.typeId || 1,
          isMB: marketData.isMB || false,
          sportMarketId: marketData.sportMarketId || 0,
          sv: marketData.sv,
          id: marketData.id,
          name: marketData.name
        },
        widgetInfo: {
          widget: 12,
          page: 3,
          tabIndex: 3,
          tipsterId: null,
          suggestionType: null
        }
      };
      
      addSelection(selection);
    }
  };

  return (
    <button 
      onClick={isButtonDisabled ? undefined : handleClick}
      disabled={isButtonDisabled}
      className={`
        flex items-center justify-between p-2 rounded border transition-colors relative
        ${isButtonDisabled 
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }
        ${finalIsSelected && !isButtonDisabled ? 'bg-red-100 border-red-300 text-red-900' : ''}
        ${className}
      `}
    >
      {/* Ícone de cadeado para odds desativadas */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className={`text-sm ${isButtonDisabled ? 'text-gray-400' : (finalIsSelected ? 'text-red-900' : 'text-gray-700')}`}>
        {label}
      </div>
      <div className={`font-bold ${isButtonDisabled ? 'text-gray-400' : (finalIsSelected ? 'text-red-600' : 'text-blue-500')}`}>
        {odds}
      </div>
    </button>
  );
}
