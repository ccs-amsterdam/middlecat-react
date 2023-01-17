import axios from "axios";
import jwtDecode from "jwt-decode";
import { Dispatch, SetStateAction } from "react";
import { AccessTokenPayload, MiddlecatUser } from "./types";

/**
 *
 * @param access_token
 * @param refresh_token
 * @param storeToken
 * @param setUser        includes setUser so that it can set state to undefined if refresh fails or session is killed
 * @returns
 */
export function createGuestUser(
  guest_token: string,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
): MiddlecatUser | undefined {
  if (!guest_token) return undefined;
  const payload: AccessTokenPayload = jwtDecode(guest_token);

  const api = axios.create({
    headers: {
      Authorization: `Bearer ${guest_token}`,
    },
  });

  const killSession = async (signOutMiddlecat: boolean) => setUser(undefined);

  return {
    email: "",
    name: payload.name,
    image: "",
    api,
    guestSessionId: payload.guestSessionId || "",
    resource: payload.resource || "",
    killSession,
  };
}
