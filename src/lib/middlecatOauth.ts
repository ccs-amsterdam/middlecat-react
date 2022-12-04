import pkceChallenge from "pkce-challenge";
import { AmcatUser } from "./types";
import { safeURL } from "./util";

export function authorize(amcatHost: string) {
  const redirect_uri = window.location.href;
  const pkce = pkceChallenge();
  const state = (Math.random() + 1).toString(36).substring(2);

  // should actually get this from amcathost endpoint
  const middlecat = safeURL("http://localhost:3000");

  // need to remember code_verifier and state, and this needs to work across
  // sessions because auth with magic links continues in new window.
  localStorage.setItem(amcatHost + "_code_verifier", pkce.code_verifier);
  localStorage.setItem(amcatHost + "_state", state);
  localStorage.setItem(amcatHost + "_middlecat", middlecat);
  window.location.href = `${middlecat}/authorize?state=${state}&redirect_uri=${redirect_uri}&resource=${amcatHost}&code_challenge=${pkce.code_challenge}`;
}

export async function authorizationCode(
  code: string,
  state: string,
  amcatHost: string
) {
  const sendState = localStorage.getItem(amcatHost + "_state");
  const middlecat = localStorage.getItem(amcatHost + "_middlecat");
  if (!middlecat || sendState !== state) return;
  // checking the state serves a both security and for distinguishes multiple flows
  // (if multiple useMiddlecat hooks are used simultaneously)

  const body = {
    grant_type: "authorization_code",
    code,
    code_verifier: localStorage.getItem(amcatHost + "_code_verifier"),
  };

  const res = await fetch(`${middlecat}/api/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // cleanup. Not strictly needed because they have now lost
  // their power, but still feels nice
  localStorage.removeItem(amcatHost + "_code_verifier");
  localStorage.removeItem(amcatHost + "_state");

  return createAmcatUser(middlecat, await res.json());
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

  return createAmcatUser(middlecat, await res.json());
}

function createAmcatUser(
  middlecat: string,
  authData: {
    amcat_user: AmcatUser;
    access_token: string;
    refresh_token: string;
  }
): AmcatUser | undefined {
  const { amcat_user, access_token, refresh_token } = authData;
  if (!amcat_user) return undefined;

  // instead of including the refresh token, we return a function that has the
  // refresh token (and middlecat host) in a closure. When called, it returns
  // the same values as the authorizationCode function with a new access_token and
  // refresh_function
  const refresh = async () => refreshToken(middlecat, refresh_token);
  const killSession = async () =>
    killMiddlecatSession(middlecat, refresh_token);

  return { ...amcat_user, token: access_token, refresh, killSession };
}

async function killMiddlecatSession(
  middlecat: string | null,
  refresh_token: string
): Promise<void> {
  const body = {
    grant_type: "kill_session",
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
}
