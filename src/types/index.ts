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
  id: number;
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
  id: number;
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
