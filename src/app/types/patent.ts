export interface Patent {
  id: string;
  title: string;
  abstract: string;
  filing_date: string;
  grant_date: string | null;
  cpc_codes: string[];
  inventors: string[];
}

export interface InnovationGap {
  title: string;
  description: string;
  sourcePatents: Patent[]
  score: number;
  potentialMarkets: string;
}

