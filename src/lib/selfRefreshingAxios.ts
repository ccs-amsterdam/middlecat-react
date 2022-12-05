import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { AccessTokenPayload, MiddlecatUser } from "./types";
import jwtDecode from "jwt-decode";

/**
 * Creates an axios instance for making api requests to the AmCAT server.
 * The tokens are stored in the closure, and are automatically refreshed
 * when a request is made and the access token is about to expire.
 *
 * @param middlecat
 * @param resource
 * @param access_token
 * @param refresh_token
 * @returns
 */
export default function selfRefreshingAxios(
  resource: string,
  access_token: string,
  refresh_token: string,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
) {
  const api = axios.create();

  // use in intercepter as closure
  let currentAccessToken = access_token;
  let currentRefreshToken = refresh_token;

  api.interceptors.request.use(
    async (config) => {
      const { access_token, refresh_token } = await getTokens(
        currentAccessToken,
        currentRefreshToken
      );
      currentAccessToken = access_token;
      currentRefreshToken = refresh_token;
      if (!currentAccessToken) {
        setUser(undefined);
        throw new Error("Could not refresh token");
      }

      // ensure that resource is the base url, so that its not easy to
      // to send a request with the tokens somewhere else
      config.baseURL = resource;

      config.headers = {
        Authorization: `Bearer ${currentAccessToken}`,
      };

      return config;
    },
    function (error) {
      Promise.reject(error);
    }
  );

  return api;
}

/**
 * Checks if access token is about to expire. If so, we first refresh the tokens.
 */
async function getTokens(access_token: string, refresh_token: string) {
  const payload: AccessTokenPayload = jwtDecode(access_token);

  const now = Date.now() / 1000;
  const nearfuture = now + 61; // don't wait till last minute
  if (payload.exp < nearfuture) {
    return await refreshToken(payload.middlecat, refresh_token);
  } else {
    return { access_token, refresh_token };
  }
}

async function refreshToken(middlecat: string, refresh_token: string) {
  const body = {
    grant_type: "refresh_token",
    refresh_token,
  };

  const res = await fetch(`${middlecat}/api/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}
