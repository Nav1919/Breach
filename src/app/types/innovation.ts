import { Patent } from './patent';

export interface InnovationGap {
  title: string;
  description: string;
  sourcePatents: Patent[];
  potentialUseCase: string;
  technicalChallenges: string;
  marketPotential: string | number;
  patentabilityScore: string | number;
  score: number;
}

export interface InnovationResponse {
  innovations: InnovationGap[];
  totalFound: number;
}