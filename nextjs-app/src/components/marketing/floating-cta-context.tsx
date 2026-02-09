'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type FloatingCTAContextType = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
};

const FloatingCTAContext = createContext<FloatingCTAContextType>({
  isVisible: false,
  setIsVisible: () => {},
  isExpanded: true,
  setIsExpanded: () => {},
});

export function useFloatingCTA() {
  return useContext(FloatingCTAContext);
}

export function FloatingCTAProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <FloatingCTAContext.Provider value={{ isVisible, setIsVisible, isExpanded, setIsExpanded }}>
      {children}
    </FloatingCTAContext.Provider>
  );
}
