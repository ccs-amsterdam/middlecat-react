import pkceChallenge from "pkce-challenge";

import { safeURL } from "./util";

export async function authorize(resource: string) {
  const redirect_uri = window.location.href;
  const pkce = pkceChallenge();
  const state = (Math.random() + 1).toString(36).substring(2);

  const res = await fetch(`${safeURL(resource)}/middlecat`);
  let { middlecat_url } = await res.json();
  middlecat_url = safeURL(middlecat_url);
  if (res.status !== 200 || !middlecat_url)
    throw new Error("Could not get MiddleCat URL from resource");

  // need to remember code_verifier and state, and this needs to work across
  // sessions because auth with magic links continues in new window.
  localStorage.setItem(resource + "_code_verifier", pkce.code_verifier);
  localStorage.setItem(resource + "_state", state);
  localStorage.setItem(resource + "_middlecat", middlecat_url);

  // the client_id has to be the host of the redirect_uri. At some point
  // we might add support for registered client_id, where redirect-uris are
  // known.
  const clientURL = new URL(redirect_uri);
  const client_id = clientURL.host;

  return `${middlecat_url}/authorize?response_type=code&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}&resource=${resource}&code_challenge=${pkce.code_challenge}`;
}

export async function authorizationCode(
  resource: string,
  code: string,
  state: string
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
