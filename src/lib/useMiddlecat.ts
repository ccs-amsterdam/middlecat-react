import {
  useCallback,
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { safeURL, silentDeleteSearchParams } from "./util";
import { authorizationCode, authorize } from "./middlecatOauth";
import { MiddlecatUser } from "./types";
import { createMiddlecatUser } from "./createMiddlecatUser";
import authFormGenerator from "./authFormGenerator";
import { refreshToken } from "./middlecatOauth";
import { createGuestUser } from "./createGuesteUser";
import axios from "axios";

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
 * @param autoReconnect If user did not log out, automatically reconnect on next visit. default is true
 * @param storeToken    If TRUE, store the refresh token. This is less secure, but lets users persist connection across sessions.
 * @param bff           If TRUE, and
 * @returns
 */

interface useMiddlecatParams {
  autoReconnect?: boolean;
  storeToken?: boolean;
  bff?: string | undefined;
}

interface useMiddlecatOut {
  user: MiddlecatUser | undefined;
  AuthForm: any;
  loading: boolean;
  signIn: (resource: string) => void;
  signInGuest: (resource: string, name: string, authDisabled: boolean) => void;
  signOut: (signOutMiddlecat: boolean) => void;
}

export default function useMiddlecat(
  {
    autoReconnect = true,
    storeToken = false, // Stores refresh token in localstorage to persist across sessions, at the cost of making them more vulnerable to XSS
    bff = undefined, // use backend-for-frontend to intercept refresh token for better security. Requires setting up a bff endpoint,
  }: useMiddlecatParams = { autoReconnect: true, storeToken: false }
): useMiddlecatOut {
  const [user, setUser] = useState<MiddlecatUser>();
  const runOnce = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const signIn = useCallback((resource: string, middlecat_url?: string) => {
    // action 1. Redirects to middlecat, which will redirect back with code and state
    // parameters. This triggers the authorizationCode flow.
    setError("");
    let r = safeURL(resource);
    setLoading(true);
    authorize(r, middlecat_url)
      .then((middlecat_redirect) => {
        localStorage.setItem("resource", r);
        localStorage.setItem("awaiting_oauth_redirect", "true");
        localStorage.removeItem(r + "_guest");
        window.location.href = middlecat_redirect;
      })
      .catch((e) => {
        setError(
          e.message.includes("timeout")
            ? "Timeout exceeded"
            : "Could not connect to server"
        );
        setTimeout(() => setError(""), 3000);
        console.error(e);
        setLoading(false);
      });
  }, []);

  const signInGuest = useCallback(
    (resource: string, name: string, authDisabled: boolean) => {
      let r = safeURL(resource);
      localStorage.setItem("resource", r);

      if (authDisabled) {
        localStorage.removeItem(r + "_guest");
        setUser(createGuestUser("authentication disabled", r, setUser, true));
      } else {
        if (storeToken || bff) localStorage.setItem(r + "_guest", name);
        setUser(createGuestUser(name, r, setUser));
      }
    },
    [bff, storeToken]
  );

  const signOut = useCallback(
    (signOutMiddlecat: boolean = false) => {
      setLoading(true);
      const resource = localStorage.getItem("resource");
      localStorage.removeItem(resource + "_guest");
      localStorage.removeItem("resource");
      if (!user) return;
      // currently doesn't tell the user if could not kill
      // session because middlecat can't be reached. Should we?
      user
        .killSession(signOutMiddlecat)
        .catch((e: Error) => console.error(e))
        .finally(() => {
          setLoading(false);
          setUser(undefined);
        });
    },
    [user]
  );

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
    const inFlow = localStorage.getItem("awaiting_oauth_redirect") === "true";
    localStorage.setItem("awaiting_oauth_redirect", "false");
    silentDeleteSearchParams(["code", "state"]);

    // If in oauth flow and code and state parameters are given, complete the oauth flow.
    // (the inFlow shouldn't be needed since we remove the URL parameters, but this somehow
    //  doesn't work when useMiddlecat is imported in nextJS. so this is just to be sure)
    if (inFlow && code && state) {
      connectWithAuthGrant(
        resource,
        code,
        state,
        storeToken,
        bff,
        setUser,
        setLoading
      );
      return;
    }

    // If autoReconnect and storeToken/bff are used, reconnect with the stored refresh token
    if (autoReconnect && (storeToken || bff)) {
      resumeConnection(
        resource,
        storeToken,
        bff,
        setUser,
        setLoading,
        setError
      );
      return;
    } else {
      setLoading(false);
    }
  }, [autoReconnect, storeToken, signIn, bff]);

  const AuthForm = useMemo(() => {
    return authFormGenerator({
      user,
      loading,
      error,
      signIn,
      signInGuest,
      signOut,
    });
  }, [user, loading, error, signIn, signInGuest, signOut]);

  return { user, AuthForm, loading, signIn, signInGuest, signOut };
}

function connectWithAuthGrant(
  resource: string,
  code: string,
  state: string,
  storeToken: boolean,
  bff: string | undefined,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>,
  setLoading: Dispatch<SetStateAction<boolean>>
) {
  authorizationCode(resource, code, state, bff)
    .then(({ access_token, refresh_token }) => {
      const user = createMiddlecatUser(
        access_token,
        refresh_token,
        storeToken,
        bff,
        resource,
        setUser
      );
      localStorage.setItem("resource", resource);
      setUser(user);
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      setLoading(false);
    });
}

async function resumeConnection(
  resource: string,
  storeToken: boolean,
  bff: string | undefined,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>
) {
  const middlecat = localStorage.getItem(resource + "_middlecat") || "";
  const refresh_token =
    storeToken && !bff ? localStorage.getItem(resource + "_refresh") : null;

  // check server, because config might have changed
  let res;
  try {
    res = await axios.get(`${safeURL(resource)}/config`, {
      timeout: 5000,
    });
  } catch (e) {
    console.error(e);
  }
  if (!res || res.status !== 200) {
    setLoading(false);
    setError(`could not connect to ${resource}`);
    return;
  }

  if (res.data.authorization === "no_auth") {
    setUser(createGuestUser("", resource, setUser, true));
    setLoading(false);
    return null;
  }

  const guest: string = localStorage.getItem(resource + "_guest") || "";
  if (res.data.authorization === "allow_guests" && guest) {
    setUser(createGuestUser(guest, resource, setUser));
    setLoading(false);
    return null;
  }

  refreshToken(middlecat, refresh_token || "", resource, bff)
    .then(({ access_token, refresh_token }) => {
      const user = createMiddlecatUser(
        access_token,
        refresh_token,
        storeToken,
        bff,
        resource || "",
        setUser
      );
      localStorage.setItem("resource", resource);
      setUser(user);
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      setLoading(false);
    });
}
