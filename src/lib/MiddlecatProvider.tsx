"use client";

import useMiddlecatConnection from "./useMiddlecatConnection";
import { ReactNode, createContext, useContext } from "react";
import { Middlecat } from "./types";
import LoginModal from "./LoginModal";
import { silentDeleteSearchParams } from "./util";

const MiddlecatContext = createContext<Partial<Middlecat>>({});

interface Props {
  children: ReactNode;
  autoConnect?: boolean;
  storeToken?: boolean;
  bff?: string | undefined;
  fixedResource?: string | undefined;
  resourceRequired?: boolean;
  loginModalProps?: {
    title: string;
    primary?: string;
    secondary?: string;
    fontSize?: string;
  };
  cleanupParams?: () => void;
}

export function MiddlecatProvider({
  children,
  autoConnect,
  storeToken,
  bff,
  fixedResource,
  resourceRequired,
  loginModalProps,
  cleanupParams,
}: Props) {
  const middlecat = useMiddlecatConnection({
    onFinishOauth: cleanupParams || silentDeleteSearchParams,
    autoConnect,
    storeToken,
    bff,
    fixedResource,
  });

  return (
    <MiddlecatContext.Provider value={middlecat}>
      {children}
      {resourceRequired ? (
        <LoginModal
          {...loginModalProps}
          middlecat={middlecat}
          fixedResource={fixedResource}
          resourceRequired={resourceRequired}
        />
      ) : null}
    </MiddlecatContext.Provider>
  );
}

export const useMiddlecat = () => useContext(MiddlecatContext) as Middlecat;
