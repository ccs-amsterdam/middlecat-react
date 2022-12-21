import { Dispatch, SetStateAction } from "react";
import { MiddlecatUser } from "./types";
export declare function authorize(resource: string): Promise<string>;
export declare function authorizationCode(resource: string, code: string, state: string, bff: string | undefined): Promise<any>;
export declare function refreshToken(middlecat: string, refresh_token: string, resource: string, bff: string | undefined): Promise<any>;
/**
 * Not really part of the oauth flow, but included it in the /token
 * endpoint as a grant_type because it has many similarities. Basically,
 * we use a refresh token (even an expired one) to kill a middlecat session.
 */
export declare function killMiddlecatSession(middlecat: string | null, refresh_token: string, signOutMiddlecat: boolean, resource: string, bff: string | undefined, setUser: Dispatch<SetStateAction<MiddlecatUser | undefined>>): Promise<void>;
