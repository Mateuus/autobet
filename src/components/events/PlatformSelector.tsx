'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, ExternalLink, Settings } from 'lucide-react';
import platformConfig from '@/config/platform_config.json';

interface Platform {
  id: string;
  name: string;
  description: string;
  defaultSite: string;
  integration: string;
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  url: string;
  integration: string;
  isDefault: boolean;
}

interface PlatformSelectorProps {
  onPlatformSelect: (platform: Platform, site: Site) => void;
  selectedPlatform?: Platform;
  selectedSite?: Site;
}

export default function PlatformSelector({ 
  onPlatformSelect, 
  selectedPlatform, 
  selectedSite 
}: PlatformSelectorProps) {
  const [platforms] = useState<Platform[]>(platformConfig.platforms);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(
    selectedPlatform?.id || ''
  );
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    selectedSite?.id || ''
  );

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatformId(platform.id);
    setSelectedSiteId(platform.defaultSite);
    
    const defaultSite = platform.sites.find(site => site.id === platform.defaultSite);
    if (defaultSite) {
      onPlatformSelect(platform, defaultSite);
    }
  };

  const handleSiteSelect = (platform: Platform, site: Site) => {
    setSelectedSiteId(site.id);
    onPlatformSelect(platform, site);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Escolha sua Plataforma
        </h2>
        <p className="text-gray-700">
          Selecione a plataforma e casa de apostas que deseja usar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPlatformId === platform.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handlePlatformSelect(platform)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">{platform.name}</CardTitle>
                {selectedPlatformId === platform.id && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">{platform.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Casas Disponíveis:</span>
                </div>
                
                <div className="space-y-2">
                  {platform.sites.map((site) => (
                    <div
                      key={site.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                        selectedPlatformId === platform.id && selectedSiteId === site.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSiteSelect(platform, site);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800">{site.name}</span>
                        {site.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {site.url.replace('https://', '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlatform && selectedSite && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800">Plataforma Selecionada</span>
          </div>
          <p className="text-green-700">
            <strong>{selectedPlatform.name}</strong> - {selectedSite.name}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Integration: {selectedSite.integration}
          </p>
        </div>
      )}
    </div>
  );
}
