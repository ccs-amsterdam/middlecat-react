export interface AmcatUser {
  /** hostname (e.g. "https://vu.amcat.nl/api") */
  host: string;
  /** user signin email */
  email: string;
  /** user name */
  name: string;
  /** image */
  image: string;
  /** amcat resource access_token */
  token: string;
  /** function to refresh the token */
  refresh: () => Promise<AmcatUser | undefined>;
  /** Kill a middlecat session. Used internally on signout */
  killSession: () => Promise<void>;
  /** Access token expiration time */
  exp: number;
  /** Middlecat host */
  middlecat: string;
}
