import type { Crop } from './types';

export const CROP_LIST: Crop[] = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice'];

export const CROP_EMOJI: Record<Crop, string> = {
  Tomato: '🍅', Onion: '🧅', Potato: '🥔',
  Wheat: '🌾', Rice: '🍚',
  Sugarcane: '🎋', Cotton: '🌱', Soybean: '🫘',
};

export const QUALITY_GRADES = ['A', 'B', 'C'] as const;
