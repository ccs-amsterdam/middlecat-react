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
  /** Kill the AmCAT session and optionally also the MiddleCat session. Used internally on signout */
  killSession: (signOutMiddlecat: boolean) => Promise<void>;
}

export interface AccessTokenPayload {
  clientId: string;
  resource: string;
  email: string;
  name: string;
  image: string;
  exp: number;
  middlecat: string;
}
