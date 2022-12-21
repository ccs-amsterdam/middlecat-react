/// <reference types="react" />
import { MiddlecatUser } from "./types";
interface Props {
    fixedResource: string;
    user: MiddlecatUser | undefined;
    loading: boolean;
    signIn: (resource?: string) => void;
    signOut: () => void;
}
interface AuthFormProps {
    primary?: string;
    secondary?: string;
    resourceLabel?: string;
    resourceExample?: string;
    resourceSuggestion?: string;
    signInLabel?: string;
    signOutLabel?: string;
}
/** Returns an AuthForm component in which the
 * props (fixedResource, user, loading, signIn, signOut)
 * are included via closure. This way,
 * the only props that need to be specified for
 * the auth form are the AuthFormProps
 */
export default function authFormGenerator({ fixedResource, user, loading, signIn, signOut, }: Props): import("react").MemoExoticComponent<({ primary, secondary, resourceLabel, resourceExample, resourceSuggestion, signInLabel, signOutLabel, }: AuthFormProps) => JSX.Element>;
export {};