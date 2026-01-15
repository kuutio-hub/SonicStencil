// FIX: Import Dispatch and SetStateAction to resolve React namespace errors.
import type { Dispatch, SetStateAction } from 'react';

export interface CardData {
  artist: string;
  title: string;
  year: string;
  fact?: string;
  qr_url: string;
  code1?: string;
  code2?: string;
}

export type CardMode = 'card' | 'token';

export type DesignConfigCategory = Exclude<keyof DesignConfig, 'mode'>;

export interface DesignConfig {
  mode: CardMode;
  token: {
    text1: string;
    text2?: string;
    text1Size: number;
    text2Size: number;
    textColor: string;
    showFrame: boolean;
    frameGlow: number;
    frameColor: string;
  };
  card: {
    width: number;
    height: number;
    borderRadius: number;
    backgroundColor: string;
    borderWidth: number;
    borderColor: string;
  };
  vinyl: {
    enabled: boolean;
    style: 'glitch' | 'classic' | 'cassette' | 'soundwave' | 'equalizer' | 'sunburst' | 'lissajous' | 'nebula' | 'grid' | 'none';
    lineColor: string;
    lineGap: number;
    lineWidth: number;
    glowIntensity: number;
    ringCount: number;
    clipMargin: number; // Can be negative for bleeding
    neon: boolean;
    aiBackground?: string; // Base64 image
    // Style specific params
    soundwavePoints: number;
    soundwaveAmplitude: number;
    soundwaveFrequency: number;
    equalizerBars: number;
    equalizerMaxHeight: number;
    sunburstLines: number;
    gridDensity: number;
  };
  front: {
    artistFontSize: number;
    artistColor: string;
    artistOffset: number; // distance from top border in pt
    titleFontSize: number;
    titleColor: string;
    titleOffset: number; // distance from bottom border in pt
    fontFamily: string;
  };
  back: {
    artistFontSize: number;
    artistColor: string;
    titleFontSize: number;
    titleColor: string;
    yearFontSize: number;
    yearColor: string;
    factFontSize: number;
    factColor: string;
    fontFamily: string;
    codeFontSize: number;
    codeRotation: 'mirrored' | 'uniform';
  };
  qrCode: {
    size: number;
    color: string;
    bgColor: string;
    bgTransparent: boolean;
    positionX: number;
    positionY: number;
    frame: boolean;
    frameWidth: number; // padding
    frameBgColor: string;
  };
  page: {
    cardsPerPage: number;
    autoFit: boolean;
    gap: number;
    padding: number;
    pageFormat: 'A4' | 'A3' | 'A5';
    mirrorBacks: boolean;
  };
}

export type Language = 'hu' | 'en' | 'de' | 'es' | 'fr';

export type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Types for DesignContext reducer
export type Action =
  | { type: 'UPDATE_SETTING'; payload: { category: DesignConfigCategory; property: string; value: any } }
  | { type: 'SET_MODE'; payload: CardMode }
  | { type: 'LOAD_CONFIG'; payload: DesignConfig };

// Types for Context Providers
export interface DesignContextState {
  state: DesignConfig;
  // FIX: Use imported Dispatch type directly.
  dispatch: Dispatch<Action>;
}

export interface CardDataContextState {
  cardData: CardData[];
  // FIX: Use imported Dispatch and SetStateAction types directly.
  setCardData: Dispatch<SetStateAction<CardData[]>>;
}