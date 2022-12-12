export declare function authorize(resource: string): Promise<string>;
export declare function authorizationCode(resource: string, code: string, state: string): Promise<any>;
