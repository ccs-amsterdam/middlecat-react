import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { MiddlecatUser } from "./types";

/**
 *
 * @param access_token
 * @param refresh_token
 * @param storeToken
 * @param setUser        includes setUser so that it can set state to undefined if refresh fails or session is killed
 * @returns
 */
export function createGuestUser(
  name: string,
  resource: string,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>,
  authDisabled: boolean = false
): MiddlecatUser | undefined {
  if (!resource) return undefined;

  const api = axios.create({
    baseURL: resource,
  });

  const killSession = async (signOutMiddlecat: boolean) => setUser(undefined);

  return {
    email: "",
    name: authDisabled ? "Authorization disabled" : name || "guest user",
    image: "",
    api,
    resource: resource || "",
    killSession,
    authDisabled,
  };
}
