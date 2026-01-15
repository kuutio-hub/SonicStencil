import React, { createContext, useReducer, useContext } from 'react';
import type { DesignConfig, Action, DesignContextState, DesignConfigCategory, CardMode } from '../types.ts';
import { DEFAULT_DESIGN_CONFIG } from '../constants.ts';

const DesignContext = createContext<DesignContextState | undefined>(undefined);

const designReducer = (state: DesignConfig, action: Action): DesignConfig => {
  switch (action.type) {
    case 'UPDATE_SETTING': {
      const { category, property, value } = action.payload;
      // A speciális eset kezelése, ahol a kártya méretét együtt kell frissíteni
      if (category === 'card' && property === 'width') {
        return {
            ...state,
            card: {
                ...state.card,
                width: value,
                height: value,
            }
        }
      }
      return {
        ...state,
        [category]: {
          ...state[category],
          [property]: value,
        },
      };
    }
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    case 'LOAD_CONFIG':
      return action.payload;
    default:
      return state;
  }
};

interface DesignProviderProps {
    children: React.ReactNode;
    initialState?: DesignConfig;
}

export const DesignProvider: React.FC<DesignProviderProps> = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(designReducer, initialState || DEFAULT_DESIGN_CONFIG);

  return (
    <DesignContext.Provider value={{ state, dispatch }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = (): DesignContextState => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};