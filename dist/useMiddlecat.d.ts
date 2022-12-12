import { MiddlecatUser } from "./types";
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
 * @param autoReconnect If user did not log out, automatically reconnect on next visit
 * @param storeToken    If TRUE, store the refresh token. This is less secure, but lets users persist connection across sessions.
 * @returns
 */
interface useMiddlecatParams {
    fixedResource?: string;
    autoReconnect?: boolean;
    storeToken?: boolean;
}
interface useMiddlecatOut {
    user: MiddlecatUser | undefined;
    AuthForm: any;
    loading: boolean;
    signIn: (resource?: string) => void;
    signOut: (signOutMiddlecat: boolean) => void;
}
export default function useMiddlecat({ fixedResource, autoReconnect, storeToken, }?: useMiddlecatParams): useMiddlecatOut;
export {};
