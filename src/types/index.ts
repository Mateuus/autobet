// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user?: {
    id: number;
    name: string;
    email: string;
    username: string;
    token: string;
    [key: string]: unknown;
  };
  userInfo?: {
    user_id: number;
    [key: string]: unknown;
  };
  need_change_password?: boolean;
}

export interface UserToken {
  user_id: string;
  token: string;
  expires_at: string;
}

export interface PlatformToken {
  accessToken: string;
  currency: string;
  isUserLocked: boolean;
  isAgency: boolean;
  currencySign: string;
  currencyId: number;
  currencyDisplay: number;
  encryptedPlayerId: string;
  regDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  email_verified_at: string | null;
  balance: number;
  active: number;
  status: string;
  ftd_paid: number;
  ftd_active: number | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  last_real_login_at: string;
  gender: number;
  kyc_verification: number;
  referrer_id: string | null;
  identity_verify: number;
  country: string | null;
  is_suspended: boolean;
  is_self_excluded: boolean;
  address_verify: number;
  accepted_domain_migration: boolean;
  pix_type: string;
  document: {
    id: number;
    number: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  address: {
    id: number;
    user_id: string;
    street: string;
    city: string;
    state: string;
    neighborhood: string;
    number: string;
    zip_code: string;
    created_at: string;
    updated_at: string;
  };
  commission: unknown | null;
  deposit_rollover: {
    id: number;
    user_id: string;
    total: number;
    amount: number;
  };
  user_rollover: unknown | null;
  settings: Array<{
    user_id: string;
    name: string;
    value: number | boolean;
    type: string;
  }>;
  is_email_valid: boolean;
  is_phone_valid: boolean;
}

// Tipos para apostas
export interface BetData {
  culture?: string;
  timezoneOffset?: number;
  integration?: string;
  deviceType?: number;
  numFormat?: string;
  countryCode?: string;
  betType?: number;
  isAutoCharge?: boolean;
  stakes: number[];
  oddsChangeAction?: number;
  betMarkets: BetMarket[];
  eachWays?: boolean[];
  requestId?: string;
  confirmedByClient?: boolean;
  device?: number;
}

export interface BetMarket {
  id: number | string;
  isBanker: boolean;
  dbId: number;
  sportName: string;
  rC: boolean;
  eventName: string;
  catName: string;
  champName: string;
  sportTypeId: number;
  odds: BetOdd[];
}

export interface BetOdd {
  id: number | string;
  sPOV?: string;
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
    tabIndex?: number;
    tipsterId?: string;
    suggestionType?: string;
  };
}

export interface BetResult {
  bets: Bet[];
  error?: string;
}

export interface Bet {
  id: number;
  type: number;
  status: number;
  unitStake: number;
  totalStake: number;
  finalStake: number;
  openStake: number;
  totalWin: number;
  createdDate: string;
  combLength: number;
  linesCount: number;
  currency: string;
  selections: BetSelection[];
  remainingTotalWin: number;
  cashOutValue: number;
  partialCashOut: number;
  bonus: number;
  bonusPart: number;
  initBonusPart: number;
  bonusPartPercent: number;
  bonusInsurance: number;
  isCancelAllowed: boolean;
  totalOdds: number;
}

export interface BetSelection {
  id: number;
  status: number;
  price: number;
  priceType: number;
  name: string;
  spec: string;
  marketName: string;
  marketTypeId: number;
  isLive: boolean;
  isBetBuilder: boolean;
  isBanker: boolean;
  isVirtual: boolean;
  dbId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  isLiveOrVirtual: boolean;
  sportTypeId: number;
  sportId: number;
  champId: number;
  catId: number;
  marketId: number;
  selectionTypeId: number;
}

// Tipos para plataformas
export interface SiteConfig {
  name: string;
  url: string;
  integration: string;
  platform: 'biahosted';
}

// Tipos para API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para dashboard
export interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  totalBets: number;
  totalProfit: number;
  successRate: number;
}

// Tipos específicos para FSSB
export interface FssbBetslipRequest {
  selectionId: string;
  viewKey: number;
  isCrossBet: boolean;
  isAddedToBetslip: boolean;
  isDynamicMarket: boolean;
  isBetBuilderBet: boolean;
}

export interface FssbBetslipResponse {
  market: {
    Operation: string;
    TimeStamp: string;
    Changeset: {
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
      TemplateGroupSettings: unknown[];
      UPDATE_TIMESTAMP: string;
      BetslipLine: string;
      Name: string;
      Selections: unknown[];
      Selection: {
        _id: string;
        MarketId: string;
        EventId: string;
        SportId: string;
        MarketType: {
          IsCastMarket: boolean;
          LineTypeId: number;
          LineTypeName: string;
          Name: Record<string, string>;
          ShortName: string;
          Tier: number;
          _id: string;
        };
        Side: number;
        Type: number;
        TypeName: string;
        BetslipLine: string;
        IsDisabled: boolean;
        Name: string;
        IsOption: boolean;
        IsClientSide: boolean;
        ParticipantMapping: string;
        DisplayOdds: {
          Decimal: string;
          Malay: string;
          HK: string;
          Indo: string;
          American: string;
          Fractional: string;
        };
        TrueOdds: number;
        OutcomeType: string;
        Points: number;
        Tags: unknown[];
        TemplateOddsSettingsIndex: number;
        TemplateGroupSettingsIndex: number;
        TemplateCashoutSettingsIndex: number;
        QAParam1: number;
        QAParam2: number;
        IsRemoved: boolean;
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
      };
    };
  };
  event: {
    Operation: string;
    TimeStamp: string;
    Changeset: {
      _id: string;
      IsGoingLive: boolean;
      IsLive: boolean;
      IsRemoved: boolean;
      IsSuspended: boolean;
      IsTopLeague: boolean;
      LeagueGroupId: string;
      MarketLinesCount: number;
      MasterLeagueId: string;
      Score: {
        AwayScore: string;
        HomeScore: string;
        CombinedSecondTierScores: unknown[];
        AdditionalScores: Record<string, unknown>;
      };
      Settings: {
        IsExposureEnabled: boolean;
        IsVIPExcludeEnabled: boolean;
        IsWBComboEnabled: boolean;
        IsWBSingleEnabled: boolean;
        EarlyPayout: number;
      };
      SportId: string;
      StartEventDate: string;
      Type: string;
      UPDATE_TIMESTAMP: string;
      EventName: string;
      LeagueName: string;
      SportName: string;
      UrlEventName: string;
      UrlLeagueName: string;
      UrlRegionName: string;
      UrlSportName: string;
      Participants: Array<{
        Name: string;
        VenueRole: string;
        _id: string;
      }>;
    };
  };
  selectionId: string;
  viewKey: number;
  timestamp: string;
  intervalTiming: string;
}

export interface FssbBetsRequest {
  betName: string;
  type: string;
  count: string;
  selectionsMapped: Array<{
    id: string;
    trueOdds: number;
    displayOdds: {
      Decimal: string;
      Malay: string;
      HK: string;
      Indo: string;
      American: string;
      Fractional: string;
    };
    marketId: string;
    eventId: string;
    timestamp: string;
    intervalTiming: string;
    promotionIds: unknown[];
  }>;
  trueOdds: number;
  displayOdds: {
    Decimal: string;
    Malay: string;
    HK: string;
    Indo: string;
    American: string;
    Fractional: string;
  };
  clientOdds: string;
  comboSize: number;
  isLive: boolean;
  numberOfLines: number;
  maxStake: number;
  minStake: number;
  numberOfBets: number;
  oddStyleID: string;
  sportID: number;
  feRequestTime: string;
  metaData: {
    device: string;
    isTablet: boolean;
    bettingView: string;
    balancePriority: number;
    fullURL: string;
    userAgent: string;
    shareBetSlipCode: string;
    refererDomain: string;
    highMarginConfig: {
      enableTestCustomer: boolean;
      enableOperatorContribution: boolean;
      numberOfSelections: number;
      marketTypeIds: string[];
    };
    siteOption: boolean;
    featuredSelections: unknown[];
  };
  selectionsNames: Array<{
    id: string;
    selectionName: string;
  }>;
  selectionsPlaced: string[];
  stake: string;
  potentialReturns: number;
  freeBet: {
    id: number;
    amount: number;
    gainDecimal: number;
    isRiskFreeBet: boolean;
  };
  JackpotContribution: Record<string, unknown>;
  calculationSettings: {
    useNewCalculationSettings: boolean;
    oddsRoundingMode: number;
    gainRoundingMode: number;
    roundCombinationOdds: boolean;
  };
  fotd: number;
  tags: unknown[];
  solution: string;
}

export interface FssbBetsResponse {
  SQLTicketID: string;
  potentialReturns: number;
  status: string;
  freeBetContribution: number;
  isRiskFreeBet: boolean;
  type: string;
  creationDate: number;
  bets: Array<{
    id: number;
    oddStyleId: string;
    type: string;
    selectionsMapped: Array<{
      id: string;
    }>;
    trueOdds: number;
    clientOdds: string;
    numberOfBets: number;
    stake: number;
    potentialReturns: number;
    comboSize: number;
    numberOfLines: number;
    selections: Array<{
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
      event: {
        _id: string;
        IsLive: boolean;
        LeagueGroupId: string;
        LeagueId: string;
        LiveGameState: Record<string, unknown>;
        MasterLeagueId: string;
        Score: {
          AwayScore: string;
          HomeScore: string;
          CombinedSecondTierScores: unknown[];
          AdditionalScores: Record<string, unknown>;
        };
        Settings: {
          IsExposureEnabled: boolean;
          IsVIPExcludeEnabled: boolean;
          IsWBComboEnabled: boolean;
          IsWBSingleEnabled: boolean;
          EarlyPayout: number;
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
        Participants: Array<{
          Name: string;
        }>;
      };
      market: {
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
        TemplateGroupSettings: Array<{
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
        }>;
        UPDATE_TIMESTAMP: string;
        BetslipLine: string;
        Name: string;
        Selections: unknown[];
      };
    }>;
    mappedSelections: number[];
  }>;
}

export interface FssbBetError {
  error: {
    type: string;
    selectionsMapped: Array<{
      id: string;
      trueOdds: number;
    }>;
    stake: string;
    potentialReturns: number;
    declineReasons: Array<{
      name: string;
    }>;
  };
}

// Re-export dos tipos de eventos
export * from './events';
