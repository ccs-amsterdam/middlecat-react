import jwtDecode from "jwt-decode";
import { Dispatch, SetStateAction } from "react";
import selfRefreshingAxios from "./selfRefreshingAxios";
import { AccessTokenPayload, MiddlecatUser } from "./types";

/**
 *
 * @param access_token
 * @param refresh_token
 * @param storeToken
 * @param setUser        includes setUser so that it can set state to undefined if refresh fails or session is killed
 * @returns
 */
export function createMiddlecatUser(
  access_token: string,
  refresh_token: string,
  storeToken: boolean,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
): MiddlecatUser | undefined {
  if (!access_token) return undefined;
  const payload: AccessTokenPayload = jwtDecode(access_token);

  const api = selfRefreshingAxios(
    payload.resource,
    access_token,
    refresh_token,
    storeToken,
    setUser
  );
  const killSession = async (signOutMiddlecat: boolean) =>
    killMiddlecatSession(
      payload.middlecat,
      refresh_token,
      signOutMiddlecat,
      setUser
    );

  return {
    email: payload.email,
    name: payload.name,
    image: payload.image,
    api,
    killSession,
  };
}

async function killMiddlecatSession(
  middlecat: string | null,
  refresh_token: string,
  signOutMiddlecat: boolean,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
): Promise<void> {
  const body = {
    grant_type: "kill_session",
    sign_out: signOutMiddlecat,
    refresh_token,
  };
  await fetch(`${middlecat}/api/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  setUser(undefined);
}
