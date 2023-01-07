import axios from "axios";
import pkceChallenge from "pkce-challenge";
import { Dispatch, SetStateAction } from "react";
import { MiddlecatUser } from "./types";

import { safeURL } from "./util";

export async function authorize(resource: string) {
  // we makes sure that the redirect url doesn't contain parameters from a previous oauth flow.
  // ideally these parameters are deleted after the flow, but somehow this doesn't always work (especially in nextJS).
  const redirectURL = new URL(window.location.href);
  redirectURL.searchParams.delete("state");
  redirectURL.searchParams.delete("redirect_uri");
  redirectURL.searchParams.delete("code");
  const redirect_uri =
    redirectURL.origin + redirectURL.pathname + redirectURL.search;

  const pkce = pkceChallenge();
  const state = (Math.random() + 1).toString(36).substring(2);
  const clientURL = new URL(redirect_uri);
  const clientId = clientURL.host;

  const res = await axios.get(`${safeURL(resource)}/middlecat`, {
    timeout: 5000,
  });
  let { middlecat_url } = res.data;
  middlecat_url = safeURL(middlecat_url);
  if (res.status !== 200 || !middlecat_url)
    throw new Error("Could not get MiddleCat URL from resource");

  // need to remember code_verifier and state, and this needs to work across
  // sessions because auth with magic links continues in new window.
  localStorage.setItem(resource + "_code_verifier", pkce.code_verifier);
  localStorage.setItem(resource + "_state", state);
  localStorage.setItem(resource + "_middlecat", middlecat_url);
  return `${middlecat_url}/authorize?client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&resource=${resource}&code_challenge=${pkce.code_challenge}`;
}

export async function authorizationCode(
  resource: string,
  code: string,
  state: string,
  bff: string | undefined
) {
  const sendState = localStorage.getItem(resource + "_state");
  const middlecat = localStorage.getItem(resource + "_middlecat");
  let code_verifier = localStorage.getItem(resource + "_code_verifier");

  if (!middlecat || sendState !== state) {
    // if state doesn't match, something fishy is going on. We won't send the actual code_verifier, but instead
    // send an obvious wrong code_verifier, which will cause middlecat to kill the session
    code_verifier = "DoYouReallyWantToHurtMe?";
  }
  const body: any = {
    grant_type: "authorization_code",
    code,
    code_verifier,
  };

  let url = `${middlecat}/api/token`;
  if (bff) {
    body.middlecat_url = url;
    body.resource = resource;
    url = bff;
  }

  const res = await axios.post(url, body);

  // cleanup. Not strictly needed because they have now lost
  // their power, but still feels nice
  localStorage.removeItem(resource + "_code_verifier");
  localStorage.removeItem(resource + "_state");

  return res.data;
}

export async function refreshToken(
  middlecat: string,
  refresh_token: string,
  resource: string,
  bff: string | undefined
) {
  const body: any = {
    grant_type: "refresh_token",
    refresh_token,
  };

  let url = `${middlecat}/api/token`;
  if (bff) {
    body.middlecat_url = url;
    body.resource = resource;
    url = bff;
  }

  const res = await axios.post(url, body);
  return res.data;
}

/**
 * Not really part of the oauth flow, but included it in the /token
 * endpoint as a grant_type because it has many similarities. Basically,
 * we use a refresh token (even an expired one) to kill a middlecat session.
 */
export async function killMiddlecatSession(
  middlecat: string | null,
  refresh_token: string,
  signOutMiddlecat: boolean,
  resource: string,
  bff: string | undefined,
  setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>
): Promise<void> {
  const body: any = {
    grant_type: "kill_session",
    sign_out: signOutMiddlecat,
    refresh_token,
  };

  let url = `${middlecat}/api/token`;
  if (bff) {
    body.middlecat_url = url;
    body.resource = resource;
    url = bff;
  }

  await axios.post(url, body);
  setUser(undefined);
}
