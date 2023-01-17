import { Axios } from "axios";

export interface MiddlecatUser {
  /** user signin email */
  email: string;
  /** user name */
  name: string;
  /** image */
  image: string;
  /** Axios instance to make API calls */
  api: Axios;
  /** resource url */
  resource: string;
  /** Kill the AmCAT session and optionally also the MiddleCat session. Used internally on signout */
  killSession: (signOutMiddlecat: boolean) => Promise<void>;
  /** Guest session id */
  guestSessionId: string;
}

export interface AccessTokenPayload {
  clientId: string;
  resource: string;
  middlecat: string;
  name: string;
  email?: string;
  image?: string;
  exp?: number;
  /** If guest user, a unique ID to identify the user by */
  guestSessionId?: string;
  /** If there is a guest_login URL parameter, useMiddlecat signs in as a guest that has this value in the token.
   * Can for instance be used to handle specific guest type access on the server, or for passing on survey respondent ids
   */
  guestLoginId?: string;
}
