// Tipos específicos para FSSIO/FSSB
export interface FssbSport {
  _id: string;
  Name: string;
  IsActive: boolean;
}

export interface FssbLeague {
  _id: string;
  Name: string;
  SportId: string;
  IsActive: boolean;
}

export interface FssbEvent {
  _id: string;
  EventName: string;
  StartEventDate: string;
  IsLive: boolean;
  IsRemoved: boolean;
  IsSuspended: boolean;
  SportId: string;
  SportName: string;
  LeagueId: string;
  LeagueName: string;
  Participants: Array<{
    _id: string;
    Name: string;
    VenueRole: string;
  }>;
  Markets?: FssbMarket[];
}

export interface FssbMarket {
  _id: string;
  Name: string;
  MarketType: {
    _id: string;
    Name: string;
    LineTypeName: string;
    Tier: number;
  };
  Selections?: FssbSelection[];
}

export interface FssbSelection {
  _id: string;
  Name: string;
  DisplayOdds: {
    Decimal: string;
    Malay: string;
    HK: string;
    Indo: string;
    American: string;
    Fractional: string;
  };
  TrueOdds: number;
  Type: number;
  Side: number;
  IsDisabled: boolean;
  Settings: {
    MinBet: number;
    MaxWin: number;
    ComboMinBet: number;
    ComboMaxBet: number;
    SystemMaxBet: number;
    ComboMaxWin: number;
    SystemMaxWin: number;
    EnableCombos: boolean;
    EnableSingles: boolean;
    EnableSystems: boolean;
    EnableTeasers: boolean;
  };
}
