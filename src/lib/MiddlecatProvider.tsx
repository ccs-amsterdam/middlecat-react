"use client";

import useMiddlecatConnection from "./useMiddlecatConnection";
import { ReactNode, createContext, useContext } from "react";
import { Middlecat } from "./types";

const MiddlecatContext = createContext<Partial<Middlecat>>({});

interface Props {
  children: ReactNode;
  autoConnect?: boolean;
  storeToken?: boolean;
  bff?: string | undefined;
  fixedResource?: string | undefined;
}

export function MiddlecatProvider({
  children,
  autoConnect,
  storeToken,
  bff,
  fixedResource,
}: Props) {
  const middlecat = useMiddlecatConnection({
    autoConnect,
    storeToken,
    bff,
    fixedResource,
  });

  return (
    <MiddlecatContext.Provider value={middlecat}>
      {children}
    </MiddlecatContext.Provider>
  );
}

export const useMiddlecat = () => useContext(MiddlecatContext) as Middlecat;
