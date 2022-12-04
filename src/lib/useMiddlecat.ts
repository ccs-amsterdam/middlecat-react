import { useCallback, useEffect, useState } from "react";
import { safeURL, silentDeleteSearchParams } from "./util";
import { authorizationCode, authorize } from "./middlecatOauth";
import { AmcatUser } from "./types";

// This hook is to be used in React applications using middlecat

/**
 * Sign-in to an AmCAT family server using MiddleCat.
 *
 * @param amcatHost
 * @returns
 */
export default function useMiddlecat(amcatHost: string) {
  amcatHost = safeURL(amcatHost);
  const [user, setUser] = useState<AmcatUser>();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const signIn = useCallback(() => {
    // Step 1. Redirects to middlecat, which will redirect back with code and state
    // parameters. This triggers the authorizationCode flow.
    if (!user) authorize(amcatHost);
  }, [user, amcatHost]);

  useEffect(() => {
    if (user || loading) return;
    if (!code || !state) return;
    // Step 2. if code and state in url parameters, we (should be) in the middle of the
    // oauth flow. Now we can use the authorization code to get the tokens

    setLoading(true);
    silentDeleteSearchParams(["code", "state"]);

    authorizationCode(code, state, amcatHost)
      .then((amcatUser) => {
        if (amcatUser) setUser(amcatUser);
      })
      .catch((e) => {
        console.error(e);
        setUser(undefined);
      })
      .finally(() => setLoading(false));
  }, [loading, user, amcatHost, code, state]);

  useEffect(() => {
    if (!user) return;
    const secondsLeft = user.exp - Math.floor(Date.now() / 1000);
    const waitSeconds = secondsLeft - 61; // don't do it last minute
    const waitMilliseconds = waitSeconds > 0 ? waitSeconds * 1000 : 0;
    const timer = setTimeout(
      () => user.refresh().then(setUser),
      waitMilliseconds
    );
    return () => clearTimeout(timer);
  }, [user]);

  const signOut = useCallback(() => {
    if (!user) return;
    user
      .killSession()
      .then(() => setUser(undefined))
      .catch((e: Error) => console.error(e));
  }, [user]);

  return { user, loading, signIn, signOut };
}
