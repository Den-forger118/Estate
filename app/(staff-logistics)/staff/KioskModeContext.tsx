"use client";

import { createContext, useContext } from "react";

export type KioskContextValue = {
  kioskMode: boolean;
  setKioskMode: (value: boolean) => void;
};

export const KioskModeContext = createContext<KioskContextValue>({
  kioskMode: false,
  setKioskMode: () => {},
});

export function useKioskMode() {
  return useContext(KioskModeContext);
}
