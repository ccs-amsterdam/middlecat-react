import { useCallback, useEffect, useState, useRef } from "react";
import { safeURL, silentDeleteSearchParams } from "./util";
import { authorizationCode, authorize } from "./middlecatOauth";
import { MiddlecatUser } from "./types";
import { createMiddlecatUser } from "./createMiddlecatUser";

// This hook is to be used in React applications using middlecat

/**
 * Log in to MiddleCat and create a user to accessing the specified resource.
 * The MiddlecatUser object contains basic user info (name, email, image) and
 * an axios instance called "api" that can be used to make requests to the
 * resource api. Requests already have the resource set as the baseURL, and
 * access_tokens are automatically added.
 *
 * Authentication at the API works with bearer tokens (it is not certain that the
 * client and server are on the same site, so we cannot use secure samesite cookies).
 * In the current flow, a connection has to be made on every new login or page refresh,
 * because we do not want to store tokens in localstorage. We do still need to keep
 * the tokens in memory, but to mitigate risks the tokens are kept in a closure and
 * added to the axios call. Also, we use short-lived access tokens with
 * rotating refresh tokens and automatic
 *
 * @param resource The URL of a resource (e.g., https://amcat.vu.nl)
 * @returns
 */
export default function useMiddlecat(resource: string) {
  resource = safeURL(resource);
  const [user, setUser] = useState<MiddlecatUser>();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const tryAuthCode = useRef(true);

  const signIn = useCallback(() => {
    // Step 1. Redirects to middlecat, which will redirect back with code and state
    // parameters. This triggers the authorizationCode flow.
    if (!user) authorize(resource);
  }, [user, resource]);

  useEffect(() => {
    if (!tryAuthCode.current) return;
    if (!code || !state) return;
    tryAuthCode.current = false; // only try once
    // Step 2. if code and state in url parameters, we (should be) in the middle of the
    // oauth flow. Now we can use the authorization code to get the tokens. On success
    // this creates the MiddlecatUser.

    setLoading(true);
    silentDeleteSearchParams(["code", "state"]);

    authorizationCode(code, state, resource)
      .then(({ access_token, refresh_token }) => {
        const user = createMiddlecatUser(access_token, refresh_token, setUser);
        if (user) setUser(user);
      })
      .catch((e) => {
        console.error(e);
        setUser(undefined);
      })
      .finally(() => setLoading(false));
  }, [loading, setUser, resource, code, state]);

  const signOut = useCallback(() => {
    if (!user) return;
    user
      .killSession()
      .then(() => setUser(undefined))
      .catch((e: Error) => console.error(e));
  }, [user]);

  return { user, loading, signIn, signOut };
}
