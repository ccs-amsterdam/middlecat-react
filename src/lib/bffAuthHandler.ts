import Cookies from "cookies";

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
 * @param req
 * @param res
 * @returns
 */
export default async function bffAuthHandler(req: any, res: any) {
  try {
    const cookies = new Cookies(req, res);

    // base64 encode resource so it cna be used in cookie name.
    // required so that there can be multiple resource sessions at teh same time
    const resource64 = Buffer.from(req.body.resource).toString("base64");
    const refreshCookie = "refresh_" + resource64;

    // if bff auth is used, request will not contain the refresh_token,
    // but the token is instead stored in a httponly samesite cookie
    if (
      req.body.grant_type === "refresh_token" ||
      req.body.grant_type === "kill_session"
    )
      req.body.refresh_token = cookies.get(refreshCookie);

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
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000, //    30 days
    });

    // remove refresh_token from response, so that it is not returned to the client
    tokens.refresh_token = null;

    return res.status(200).json(tokens);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Could not fetch token" });
  }
}
