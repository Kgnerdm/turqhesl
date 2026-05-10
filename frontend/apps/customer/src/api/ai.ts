import { api } from './axios';
import type { Package } from '@/types';

export interface SmartMatch {
  package: Package;
  reason: string;
}

export interface SmartMatchResponse {
  matches: SmartMatch[];
}

export const smartMatchPackages = async (query: string): Promise<SmartMatchResponse> => {
  const { data } = await api.post<SmartMatchResponse>('/packages/smart-match/', { query });
  return data;
};
