export enum WasteCategory {
  RECYCLABLE = 'Recyclable',
  ORGANIC = 'Organic',
  HAZARDOUS = 'Hazardous',
  RESIDUAL = 'Residual', // General waste
  UNKNOWN = 'Unknown'
}

export type BinColor = 'blue' | 'green' | 'red' | 'gray';

export interface AnalysisResult {
  itemName: string;
  category: WasteCategory;
  binColor: BinColor;
  confidence: number;
  explanation: string;
  tip: string;
  ecoPoints: number;
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl: string;
}

export interface UserStats {
  totalPoints: number;
  itemsScanned: number;
  streakDays: number;
  level: number;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  image: string;
  description: string;
  emoji?: string;
}

export interface User {
  name: string;
  email: string;
}

export type ViewState = 'AUTH' | 'HOME' | 'SCANNER' | 'LEADERBOARD' | 'REWARDS' | 'PROFILE';