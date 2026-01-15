import React, { createContext, useState, useContext } from 'react';
import type { CardData, CardDataContextState } from '../types.ts';

const CardDataContext = createContext<CardDataContextState | undefined>(undefined);

export const CardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cardData, setCardData] = useState<CardData[]>([]);

  return (
    <CardDataContext.Provider value={{ cardData, setCardData }}>
      {children}
    </CardDataContext.Provider>
  );
};

export const useCardData = (): CardDataContextState => {
  const context = useContext(CardDataContext);
  if (!context) {
    throw new Error('useCardData must be used within a CardDataProvider');
  }
  return context;
};