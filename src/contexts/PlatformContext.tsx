'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Platform {
  id: string;
  name: string;
  description: string;
  defaultSite: string;
  integration: string;
  sites: Site[];
}

export interface Site {
  id: string;
  name: string;
  url: string;
  integration: string;
  isDefault: boolean;
}

interface PlatformContextType {
  selectedPlatform: Platform | null;
  selectedSite: Site | null;
  setSelectedPlatform: (platform: Platform | null) => void;
  setSelectedSite: (site: Site | null) => void;
  isFssbPlatform: boolean;
  isBiahostedPlatform: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const isFssbPlatform = selectedPlatform?.id === 'fssio';
  const isBiahostedPlatform = selectedPlatform?.id === 'biahosted';

  return (
    <PlatformContext.Provider
      value={{
        selectedPlatform,
        selectedSite,
        setSelectedPlatform,
        setSelectedSite,
        isFssbPlatform,
        isBiahostedPlatform,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
