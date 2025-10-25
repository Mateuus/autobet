'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BettingSelection {
  odd: {
    typeId: number;
    price: number;
    isMB: boolean;
    oddStatus: number;
    sv?: string;
    competitorId: number;
    id: string | number; // Permitir tanto string quanto number para FSSIO
    name: string;
    lineDir: number;
    priceDir: number;
    shouldUpdate: boolean;
  };
  event: {
    id: number;
    name: string;
    isParlay: boolean;
    rc: boolean;
    startDate: string;
    code: number;
    et: number;
  };
  status: number;
  isBanker: boolean;
  isEnabled: boolean;
  sport: {
    typeId: number;
    iconName: string;
    hasLiveEvents: boolean;
    id: number;
    name: string;
  };
  competitors: Array<{
    id: number;
    name: string;
    jerseySource?: number;
    jerseyChamps?: number[];
  }>;
  championship: {
    hasLiveEvents: boolean;
    id: number;
    name: string;
  };
  category: {
    iso: string;
    hasLiveEvents: boolean;
    id: number;
    name: string;
  };
  market: {
    shortName: string;
    desktopOddIds: (string | number)[][];
    mobileOddIds: (string | number)[][];
    isBB: boolean;
    so: number;
    typeId: number;
    isMB: boolean;
    sportMarketId: string | number;
    sv?: string;
    id: string | number;
    name: string;
  };
  widgetInfo: {
    widget: number;
    page: number;
    tabIndex: number;
    tipsterId: number | null;
    suggestionType: number | null;
  };
}

export interface BettingState {
  selections: BettingSelection[];
  totoCampaigns: unknown[];
  selectionView: string;
  oddIds: (string | number)[];
  boostedOddIds: number[];
  lastUpdated: string;
  isCast: boolean;
  showEachWay: boolean;
}

interface BettingContextType {
  selections: BettingSelection[];
  addSelection: (selection: BettingSelection) => void;
  removeSelection: (oddId: string | number) => void;
  clearAllSelections: () => void;
  isSelected: (oddId: string | number) => boolean;
  getTotalStake: () => number;
  getTotalWin: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<BettingSelection[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar seleções do localStorage ao inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('bettingSlip');
    console.log('🎯 [BettingContext] Carregando do localStorage:', savedState);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('🎯 [BettingContext] Estado parseado:', parsedState);
        if (parsedState.state?.selections) {
          setSelections(parsedState.state.selections);
          console.log('🎯 [BettingContext] Seleções carregadas:', parsedState.state.selections.length);
        }
      } catch (error) {
        console.error('Erro ao carregar seleções do localStorage:', error);
      }
    }
  }, []);

  // Salvar seleções no localStorage sempre que mudar
  useEffect(() => {
    const bettingState: { state: BettingState; version: number } = {
      state: {
        selections,
        totoCampaigns: [],
        selectionView: 'sport',
        oddIds: selections.map(s => s.odd.id),
        boostedOddIds: [],
        lastUpdated: new Date().toISOString(),
        isCast: false,
        showEachWay: false
      },
      version: 0
    };
    
    console.log('🎯 [BettingContext] Salvando no localStorage:', bettingState);
    localStorage.setItem('bettingSlip', JSON.stringify(bettingState));
  }, [selections]);

  const addSelection = (selection: BettingSelection) => {
    console.log('🎯 [BettingContext] Adicionando seleção:', selection.odd.id, selection.odd.name);
    setSelections(prev => {
      // Verificar se já existe uma seleção com o mesmo oddId
      const existingIndex = prev.findIndex(s => s.odd.id === selection.odd.id);
      if (existingIndex !== -1) {
        // Se já existe, remover (toggle behavior)
        console.log('🎯 [BettingContext] Removendo seleção existente (toggle)');
        return prev.filter(s => s.odd.id !== selection.odd.id);
      }
      // Se não existe, adicionar
      console.log('🎯 [BettingContext] Adicionando nova seleção');
      const newSelections = [...prev, selection];
      console.log('🎯 [BettingContext] Total de seleções:', newSelections.length);
      return newSelections;
    });
  };

  const removeSelection = (oddId: string | number) => {
    setSelections(prev => prev.filter(s => s.odd.id !== oddId));
  };

  const clearAllSelections = () => {
    setSelections([]);
  };

  const isSelected = (oddId: string | number) => {
    return selections.some(s => s.odd.id === oddId);
  };

  const getTotalStake = () => {
    // Por enquanto retorna 0, será implementado quando adicionarmos input de stake
    return 0;
  };

  const getTotalWin = () => {
    // Por enquanto retorna 0, será implementado quando adicionarmos input de stake
    return 0;
  };

  return (
    <BettingContext.Provider value={{
      selections,
      addSelection,
      removeSelection,
      clearAllSelections,
      isSelected,
      getTotalStake,
      getTotalWin,
      isOpen,
      setIsOpen
    }}>
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}
