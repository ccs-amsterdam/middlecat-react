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
export default function bffAuthHandler(req: any, res: any): Promise<any>;
