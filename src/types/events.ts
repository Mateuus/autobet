// Interfaces baseadas na estrutura real da API BiaHosted
// DadosEventoBiaHosted.json

export interface BiaHostedSport {
  typeId: number;
  iconName: string;
  hasLiveEvents: boolean;
  id: number;
  name: string;
}

export interface BiaHostedChampionship {
  hasLiveEvents: boolean;
  id: number;
  name: string;
}

export interface BiaHostedCategory {
  iso: string;
  hasLiveEvents: boolean;
  id: number;
  name: string;
}

export interface BiaHostedCompetitor {
  jerseySource: number;
  jerseyChamps: number[];
  id: number;
  name: string;
}

export interface BiaHostedMarketGroup {
  type: number;
  marketIds: number[];
  isBundle: boolean;
  sortOrder: number;
  id: number;
  name: string;
}

export interface BiaHostedMarket {
  desktopOddIds?: number[][];
  mobileOddIds?: number[][];
  childMarketIds?: number[];
  isBB: boolean;
  variant: number;
  so: number;
  typeId: number;
  isMB: boolean;
  sportMarketId: number;
  id: number;
  name: string;
  shortName?: string;
  hint?: string;
  sv?: string;
  selections?: BiaHostedSelection[];
}

export interface BiaHostedSelection {
  typeId: number;
  mst: number;
  odds: BiaHostedOdd[];
}

export interface BiaHostedOdd {
  id: number;
  name: string;
  price?: number;
  isMB?: boolean;
  oddStatus?: number;
  sv?: string;
  competitorId?: number;
  typeId?: number;
}

export interface BiaHostedEventDetail {
  id: number;
  feedEventId: number;
  name: string;
  et: number;
  sport: BiaHostedSport;
  champ: BiaHostedChampionship;
  category: BiaHostedCategory;
  competitors: BiaHostedCompetitor[];
  marketGroups: BiaHostedMarketGroup[];
  markets: BiaHostedMarket[];
  odds: BiaHostedOdd[];
  boosts: unknown[];
  nonBoosts: unknown[];
  isParlay: boolean;
  eventCode: number;
  rc: boolean;
  startDate: string;
  showAll: boolean;
}

// DadosListaEventosBiaHosted.json

export interface BiaHostedDate {
  dateTime: string;
  eventIds: number[];
}

export interface BiaHostedOffer {
  type: number;
  parameter?: number;
}

export interface BiaHostedEventListItem {
  marketIds: number[];
  isBooked: boolean;
  isParlay: boolean;
  offers: BiaHostedOffer[];
  code: number;
  hasStream: boolean;
  extId: string;
  sc: number;
  mc: number;
  rc: boolean;
  pId: number;
  et: number;
  hasStats: boolean;
  competitorIds: number[];
  sportId: number;
  catId: number;
  champId: number;
  status: number;
  startDate: string;
  id: number;
  name: string;
}

export interface BiaHostedEventsList {
  dates: BiaHostedDate[];
  events: BiaHostedEventListItem[];
}

// Tipos atualizados para compatibilidade com o sistema atual
export interface Sport {
  sport: string;
  sportId: number;
  couponType: number;
}

export interface Event {
  id: string;
  eventId: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  countryFlag: string;
  isLive: boolean;
  hasStream: boolean;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
    overLine: number;
    underLine: number;
  };
}

export interface MarketOption {
  label: string;
  odds: number;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  oddStatus?: number;
  oddId?: number;
}

// Tipos adicionais para markets e odds baseados na estrutura real
export interface MarketSelection {
  id: number;
  name: string;
  price: number;
  typeId: number;
  isMB: boolean;
  oddStatus: number;
  sv?: string;
  competitorId?: number;
}

export interface MarketType {
  id: number;
  name: string;
  shortName?: string;
  hint?: string;
  selections: MarketSelection[];
  desktopOddIds?: number[][];
  mobileOddIds?: number[][];
  isBB: boolean;
  variant: number;
  typeId: number;
  isMB: boolean;
  sportMarketId: number;
  sv?: string;
}

export interface EventMarketGroup {
  type: number;
  marketIds: number[];
  isBundle: boolean;
  sortOrder: number;
  id: number;
  name: string;
}

// Tipos para conversão entre formatos
export interface ConvertedEvent {
  id: string;
  eventId: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  countryFlag: string;
  isLive: boolean;
  hasStream: boolean;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
    overLine: number;
    underLine: number;
  };
  markets: MarketType[];
  marketGroups: EventMarketGroup[];
}

// Tipos para eventos ao vivo (Live Events)
export interface BiaHostedLiveEvent {
  liveTime?: string;
  lst?: string;
  ls?: string;
  score?: number[];
  marketIds: number[];
  isBooked: boolean;
  isParlay: boolean;
  offers?: BiaHostedOffer[];
  code?: number;
  hasStream: boolean;
  extId: string;
  sc: number;
  mc: number;
  rc: boolean;
  pId: number;
  et: number;
  hasStats: boolean;
  competitorIds: number[];
  sportId: number;
  catId: number;
  champId: number;
  status: number;
  startDate: string;
  id: number;
  name: string;
}

export interface BiaHostedLiveEventsList {
  headers: BiaHostedMarketGroup[];
  pageCount: number;
  page: number;
  markets: BiaHostedMarket[];
  odds: BiaHostedOdd[];
  events: BiaHostedLiveEvent[];
  sports: BiaHostedSport[];
  categories: BiaHostedCategory[];
  champs: BiaHostedChampionship[];
  competitors: BiaHostedCompetitor[];
}