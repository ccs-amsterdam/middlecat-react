/**
 * If useMiddlecat is used on a client that has a samesite backend, the backend
 * can be used to secure the refresh token. This handler should then be
 * put at an endpoint (like api/bffAuth), and in useMiddlecat the settings
 * bff should be set to this endpoint (e.g., bff = '/api/bffAuth')
 *
 * To secure the refresh_token, this handler intercepts the
 * authorization_code, refresh_token and kill_session grant flows. The refresh
 * token is then not returned directly to the client application, but
 * instead stored in a httponly samesite cookie.
 *
 * We didn't properly type the req, res and cookies due to issues with including this as dependencies,
 * but it should work with normal node http handlers and Next handlers.
 *
 * @param req      Node (or Next) request
 * @param res      Node (or Next) response
 * @param cookies  Cookies objects created with new Cookies(req, res) (using the 'cookies' package)
 * @returns
 */
export default async function bffAuthHandler(
  req: any,
  res: any,
  cookies: any,
  maxAge: number = 60 * 60 * 24 * 30 * 1000, // 30 days
  secure: boolean = false
) {
  try {
    // base64 encode resource and middlecat_url so it can be used in cookie name.
    // required so that there can be multiple resource sessions at the same time,
    // and ensures that refresh token is only returned to the middlecat it came from
    const name64 = Buffer.from(
      req.body.resource + "." + req.body.middlecat_url
    ).toString("base64");
    const refreshCookie = "refresh_" + name64;

    // if bff auth is used, request will not contain the refresh_token,
    // but the token is instead stored in a httponly samesite cookie
    if (
      req.body.grant_type === "refresh_token" ||
      req.body.grant_type === "kill_session"
    )
      req.body.refresh_token = cookies.get(refreshCookie) || ".";

    const tokens_res = await fetch(req.body.middlecat_url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const tokens = await tokens_res.json();

    cookies.set(refreshCookie, tokens.refresh_token, {
      secure, // need to verify whether this is the reason it doesn't work on netlify
      //secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "strict",
      maxAge,
    });

    // remove refresh_token from response, so that it is not returned to the client
    tokens.refresh_token = null;

    return res.status(200).json(tokens);
  } catch (e: any) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
}
