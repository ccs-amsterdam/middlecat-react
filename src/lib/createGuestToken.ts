import { v4 as uuidv4 } from "uuid";

/** Create a unsigned JWT to serve as a guest token. Optionally, users can give
 * a user name. The guest token also includes a guestSessionId to identify a (anonymous)
 * user across requests.
 */
export default function createGuestToken(
  resource: string,
  name: string,
  guestLoginId?: string
): string {
  const header = {
    alg: "none",
    typ: "JWT",
  };

  let guestSessionId = localStorage.getItem(resource + "_guest_session_id");
  if (!guestSessionId) {
    guestSessionId = uuidv4();
    if (!guestSessionId) throw new Error("Could not generate uuid");

    localStorage.setItem(resource + "_guest_session_id", guestSessionId);
  }

  const client = new URL(window.location.href);
  const payload: any = {
    clientId: client.host,
    resource,
    name,
    guestSessionId,
  };
  if (guestLoginId) payload.guestLoginId = guestLoginId;

  return to64(header) + "." + to64(payload) + ".";
}

function to64(payload: Record<string, string | number>) {
  const b64 = window.btoa(JSON.stringify(payload));
  return b64.replace("=", "");
}
