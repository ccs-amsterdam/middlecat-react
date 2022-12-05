import { useCallback, useEffect, useState, useRef } from "react";
import { safeURL, silentDeleteSearchParams } from "./util";
import { authorizationCode, authorize } from "./middlecatOauth";
import { MiddlecatUser } from "./types";
import { createMiddlecatUser } from "./createMiddlecatUser";

// This hook is to be used in React applications using middlecat

/**
 * Sign-in to an AmCAT family server using MiddleCat.
 *
 * @param amcatHost
 * @returns
 */
export default function useMiddlecat(amcatHost: string) {
  amcatHost = safeURL(amcatHost);
  const [user, setUser] = useState<MiddlecatUser>();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const tryAuthCode = useRef(true);

  const signIn = useCallback(() => {
    // Step 1. Redirects to middlecat, which will redirect back with code and state
    // parameters. This triggers the authorizationCode flow.
    if (!user) authorize(amcatHost);
  }, [user, amcatHost]);

  useEffect(() => {
    if (!tryAuthCode.current) return;
    if (!code || !state) return;
    tryAuthCode.current = false; // only try once
    // Step 2. if code and state in url parameters, we (should be) in the middle of the
    // oauth flow. Now we can use the authorization code to get the tokens

    setLoading(true);
    silentDeleteSearchParams(["code", "state"]);

    authorizationCode(code, state, amcatHost)
      .then(({ access_token, refresh_token }) => {
        const user = createMiddlecatUser(access_token, refresh_token, setUser);
        if (user) setUser(user);
      })
      .catch((e) => {
        console.error(e);
        setUser(undefined);
      })
      .finally(() => setLoading(false));
  }, [loading, setUser, amcatHost, code, state]);

  const signOut = useCallback(() => {
    if (!user) return;
    user
      .killSession()
      .then(() => setUser(undefined))
      .catch((e: Error) => console.error(e));
  }, [user]);

  return { user, loading, signIn, signOut };
}
