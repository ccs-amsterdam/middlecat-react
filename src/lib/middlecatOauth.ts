import pkceChallenge from "pkce-challenge";

import { safeURL } from "./util";

export function authorize(resource: string) {
  const redirect_uri = window.location.href;
  const pkce = pkceChallenge();
  const state = (Math.random() + 1).toString(36).substring(2);

  // should actually get this from resource endpoint
  const middlecat = safeURL("http://localhost:3000");

  // need to remember code_verifier and state, and this needs to work across
  // sessions because auth with magic links continues in new window.
  localStorage.setItem(resource + "_code_verifier", pkce.code_verifier);
  localStorage.setItem(resource + "_state", state);
  localStorage.setItem(resource + "_middlecat", middlecat);
  window.location.href = `${middlecat}/authorize?state=${state}&redirect_uri=${redirect_uri}&resource=${resource}&code_challenge=${pkce.code_challenge}`;
}

export async function authorizationCode(
  code: string,
  state: string,
  resource: string
) {
  const sendState = localStorage.getItem(resource + "_state");
  const middlecat = localStorage.getItem(resource + "_middlecat");
  let code_verifier = localStorage.getItem(resource + "_code_verifier");

  if (!middlecat || sendState !== state) {
    // if state doesn't match, something fishy is going on. We won't send the actual code_verifier, but instead
    // send an obvious wrong code_verifier, which will cause middlecat to kill the session
    code_verifier = "DoYouReallyWantToHurtMe?";
  }
  const body = {
    grant_type: "authorization_code",
    code,
    code_verifier,
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
  localStorage.removeItem(resource + "_code_verifier");
  localStorage.removeItem(resource + "_state");

  return await res.json();
}
