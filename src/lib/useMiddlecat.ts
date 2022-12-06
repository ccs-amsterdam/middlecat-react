import { useCallback, useEffect, useState, useRef } from "react";
import { safeURL, silentDeleteSearchParams } from "./util";
import { authorizationCode, authorize } from "./middlecatOauth";
import { MiddlecatUser } from "./types";
import { createMiddlecatUser } from "./createMiddlecatUser";
import authFormGenerator from "./authFormGenerator";

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
 * @param fixedResource Optinally, use a fixed resource (e.g., https://amcat.vu.nl)
 * @returns
 */
export default function useMiddlecat(
  fixedResource?: string,
  autoReconnect: boolean = true
) {
  const [user, setUser] = useState<MiddlecatUser>();
  const runOnce = useRef(true);
  const [loading, setLoading] = useState(true);

  const signIn = useCallback(
    (resource?: string) => {
      // action 1. Redirects to middlecat, which will redirect back with code and state
      // parameters. This triggers the authorizationCode flow.
      let r = safeURL(fixedResource || resource || "");
      authorize(r)
        .then((middlecat_redirect) => {
          localStorage.setItem("resource", r);
          window.location.href = middlecat_redirect;
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [fixedResource]
  );

  const signOut = useCallback(() => {
    localStorage.setItem("resource", "");
    if (!user) return;
    user
      .killSession()
      .then(() => setUser(undefined))
      .catch((e: Error) => console.error(e));
  }, [user]);

  useEffect(() => {
    // This runs once on mount, and can do two things
    // - if there is a 'resource' in localStorage, and there is a code and state url parameter,
    //   then middlecat just redirected here and we should complete the oauth dance
    // - if this is not the case, but we do have a resource and autoReconnect is set to true,
    //   immediately initiate another oauth dance
    if (!runOnce.current) return;
    runOnce.current = false;

    const resource = localStorage.getItem("resource");
    if (!resource) {
      setLoading(false);
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    silentDeleteSearchParams(["code", "state"]);

    if (!code || !state) {
      if (!autoReconnect) {
        setLoading(false);
      } else {
        signIn(resource);
      }
      return;
    }

    authorizationCode(resource, code, state)
      .then(({ access_token, refresh_token }) => {
        const user = createMiddlecatUser(access_token, refresh_token, setUser);
        localStorage.setItem("resource", resource);
        setUser(user);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [autoReconnect, signIn]);

  const AuthForm = authFormGenerator({
    fixedResource: fixedResource || "",
    user,
    loading,
    signIn,
    signOut,
  });

  return { user, AuthForm, loading, signIn, signOut };
}
