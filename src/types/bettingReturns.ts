/* eslint-disable @typescript-eslint/no-explicit-any */

// Tipos para retornos das apostas FSSB
export interface FSSBBetReturn {
  SQLTicketID: string;
  potentialReturns: number;
  status: 'Open' | 'Won' | 'Lost' | 'Cancelled';
  freeBetContribution: number;
  isRiskFreeBet: boolean;
  type: 'single' | 'multiple' | 'system';
  creationDate: number;
  bets: FSSBBet[];
}

export interface FSSBBet {
  id: number;
  oddStyleId: string;
  type: 'single' | 'multiple' | 'system';
  selectionsMapped: Array<{ id: string }>;
  trueOdds: number;
  clientOdds: string;
  numberOfBets: number;
  stake: number;
  potentialReturns: number;
  comboSize: number;
  numberOfLines: number;
  selections: FSSBSelection[];
  mappedSelections: number[];
}

export interface FSSBSelection {
  _id: string;
  Name: string;
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
  TrueOdds: number;
  DisplayOdds: {
    Decimal: string;
    Malay: string;
    HK: string;
    Indo: string;
    American: string;
    Fractional: string;
  };
  ClientOdds: string;
  BetslipLine: string;
  TypeName: string;
  Side: number;
  event: FSSBEvent;
  market: FSSBMarket;
}

export interface FSSBEvent {
  _id: string;
  IsLive: boolean;
  LeagueGroupId: string;
  LeagueId: string;
  LiveGameState: any;
  MasterLeagueId: string;
  Score: {
    AwayScore: string;
    HomeScore: string;
    CombinedSecondTierScores: any[];
    AdditionalScores: any;
  };
  Settings: {
    IsExposureEnabled: boolean;
    IsVIPExcludeEnabled: boolean;
    IsWBComboEnabled: boolean;
    IsWBSingleEnabled: boolean;
    EarlyPayout?: number;
  };
  SportId: string;
  StartEventDate: string;
  Type: string;
  UPDATE_TIMESTAMP: string;
  LeagueName: string;
  EventName: string;
  SportName: string;
  BetslipLine: string;
  UrlEventName: string;
  UrlLeagueName: string;
  UrlRegionName: string;
  UrlSportName: string;
  Participants: Array<{ Name: string }>;
}

export interface FSSBMarket {
  _id: string;
  ComboBonuses: string[];
  EventId: string;
  IsClientSide: boolean;
  IsLive: boolean;
  IsRemoved: boolean;
  IsSuspended: boolean;
  LastUpdateDateTime: string;
  LeagueId: string;
  MarketType: {
    LineTypeName: string;
    _id: string;
    Tier: number;
    Name: string;
  };
  ParticipantMapping: string;
  SplitTypeId: number;
  SportId: string;
  StartDate: string;
  TotalSelectionsCount: number;
  TemplateGroupSettings: any[];
  UPDATE_TIMESTAMP: string;
  BetslipLine: string;
  Name: string;
  Selections: FSSBSelection[];
}

// Tipos para retornos das apostas Biahosted
export interface BiahostedBetReturn {
  culture: string;
  timezoneOffset: number;
  integration: string;
  deviceType: number;
  numFormat: string;
  countryCode: string;
  betType: number;
  isAutoCharge: boolean;
  stakes: number[];
  oddsChangeAction: number;
  betMarkets: BiahostedBetMarket[];
  eachWays: boolean[];
  requestId: string;
  confirmedByClient: boolean;
  device: number;
}

export interface BiahostedBetMarket {
  id: number;
  isBanker: boolean;
  dbId: number;
  sportName: string;
  rC: boolean;
  eventName: string;
  catName: string;
  champName: string;
  sportTypeId: number;
  odds: BiahostedOdd[];
}

export interface BiahostedOdd {
  id: number;
  marketId: number;
  price: number;
  marketName: string;
  marketTypeId: number;
  mostBalanced: boolean;
  selectionTypeId: number;
  selectionName: string;
  widgetInfo: {
    widget: number;
    page: number;
    tabIndex: number;
  };
}

// Tipos para erros
export interface BettingError {
  type: 'AUTHENTICATION' | 'BALANCE_INSUFFICIENT' | 'ODDS_CHANGED' | 'MARKET_SUSPENDED' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  code: string;
  message: string;
  details?: any;
}

// Tipos para resultado do processamento
export interface BettingResult {
  success: boolean;
  bilheteId?: string;
  stake: number;
  odd: number;
  potentialWin: number;
  balanceBefore: number;
  balanceAfter?: number;
  error?: BettingError;
  rawResponse?: any;
}

// Tipos para criação de BetBetting
export interface CreateBetBettingData {
  accountId: string;
  description?: string;
  betConfig: any;
  stakePerAccount: number;
  totalAccounts: number;
}

// Tipos para criação de BetBilhete
export interface CreateBetBilheteData {
  platform: string;
  site: string;
  betAccountId: string;
  betBettingId: string;
  stake: number;
  balanceBefore: number;
  betData: any;
  resultData?: any;
  errorMessage?: string;
}
