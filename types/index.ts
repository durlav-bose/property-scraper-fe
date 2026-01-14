// County types
export interface County {
  _id: string;
  countyId: string;
  countyName: string;
  propertyCount: number;
  lastScraped: string;
  scrapingStatus?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  errorMessage?: string | null;
}

export interface CountyListResponse {
  success: boolean;
  count: number;
  data: County[];
}

export interface CountyDetailsResponse {
  success: boolean;
  data: County;
}

// Property types
export interface PropertyDetails {
  // Case information - both variations
  'case_#'?: string;
  'court_case_#'?: string;
  case_title?: string;
  plaintiff?: string;
  defendant?: string;
  assigned_to?: string;
  
  // Address - all variations
  'address/description'?: string;
  address?: string;
  description?: string;
  
  // Financial - both variations
  opening_bid?: string;
  starting_bid?: string;
  appraisal_amount?: string;
  appraised_value?: string;
  
  // Other details
  attorney?: string;
  writ?: string;
  appraisal?: string;
  plaintiff_appraisal?: string;
  defendant_appraisal?: string;
  referee_appraisal?: string;
  'sheriff_#'?: string;
  'parcel_#'?: string;
  sales_date?: string;
}

export interface StatusHistory {
  status: string;
  date: string;
  _id: string;
}

export interface Defendant {
  firstName: string;
  lastName: string;
  _id: string;
}

export interface Property {
  _id: string;
  propertyId: string;
  countyName: string;
  countyId?: string;
  detailUrl: string;
  details: PropertyDetails;
  status_history: StatusHistory[];
  scrapingStatus?: string;
  hasDetails?: boolean;
  defendants?: Defendant[];
  createdAt?: string;
  updatedAt?: string;
  addressLine?: string;
  state?: string;
  zipCode?: string;
  defendant?: string;
  status_header?: string;
  errorMessage?: string | null;
  lastAttempt?: string;
  uniqueIdentifier?: string;
  allCosts?: string | null;
}

export interface PropertyListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Property[];
}

export interface PropertyDetailsResponse {
  success: boolean;
  data: Property;
}

// Stats type
export interface Stats {
  totalCounties?: number;
  totalProperties?: number;
  completedCounties?: number;
  failedCounties?: number;
  [key: string]: any;
}

export interface StatsResponse {
  success: boolean;
  data: Stats;
}

// Failed items
export interface FailedCountiesResponse {
  success: boolean;
  count: number;
  data: County[];
}

export interface FailedPropertiesResponse {
  success: boolean;
  count: number;
  data: Property[];
}

// Scrape request
export interface ScrapeRequest {
  limitCounties?: number;
}

export interface ScrapeResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}
