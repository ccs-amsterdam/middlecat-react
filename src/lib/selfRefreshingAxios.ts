import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { AccessTokenPayload, MiddlecatUser } from "./types";
import jwtDecode from "jwt-decode";
import { refreshToken } from "./middlecatOauth";

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
  storeToken: boolean,
  bff: string | undefined,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
) {
  const api = axios.create();

  // use in intercepter as closure
  let currentAccessToken = access_token;
  let currentRefreshToken = refresh_token;
  if (storeToken)
    localStorage.setItem(`${resource}_refresh`, currentRefreshToken);

  api.interceptors.request.use(
    async (config) => {
      const { access_token, refresh_token } = await getTokens(
        currentAccessToken,
        currentRefreshToken,
        resource,
        bff
      );
      currentAccessToken = access_token;
      currentRefreshToken = refresh_token;
      if (storeToken && !bff)
        localStorage.setItem(`${resource}_refresh`, currentRefreshToken);
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
async function getTokens(
  access_token: string,
  refresh_token: string,
  resource: string,
  bff?: string
) {
  const payload: AccessTokenPayload = jwtDecode(access_token);

  const now = Date.now() / 1000;
  const nearfuture = now + 10; // refresh x seconds before expires
  if (payload.exp < nearfuture) {
    return await refreshToken(payload.middlecat, refresh_token, resource, bff);
  } else {
    return { access_token, refresh_token };
  }
}
