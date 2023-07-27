import { Axios } from "axios";

export interface Middlecat {
  user: MiddlecatUser | undefined;
  loading: boolean;
  error: string;
  fixedResource: string | undefined;
  signIn: (resource: string, middlecat_url?: string) => void;
  signInGuest: (
    resource: string,
    authDisabled: boolean,
    middlecat_url?: string
  ) => void;
  signOut: (signOutMiddlecat: boolean) => void;
}

export interface MiddlecatUser {
  /** user signin email */
  email: string;
  /** user name */
  name: string;
  /** image */
  image: string;
  /** is user authenticated? */
  authenticated: boolean;
  /** Authentication is disabled? */
  authDisabled?: boolean;
  /** Axios instance to make API calls */
  api: Axios;
  /** resource url */
  resource: string;
  /** middlecat url */
  middlecat: string;
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
