export declare function authorize(resource: string): Promise<string>;
export declare function authorizationCode(resource: string, code: string, state: string, bff: string | undefined): Promise<any>;
export declare function refreshToken(middlecat: string, refresh_token: string, resource: string, bff: string | undefined): Promise<any>;
