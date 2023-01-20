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
}

export interface AccessTokenPayload {
  clientId: string;
  resource: string;
  middlecat: string;
  userId: string;
  name?: string;
  email?: string;
  image?: string;
  exp?: number;
}
