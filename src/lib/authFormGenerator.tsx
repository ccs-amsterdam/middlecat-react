import { memo, useState } from "react";
import styled from "styled-components";
import { MiddlecatUser } from "./types";

interface LayoutProps {
  primary?: string;
  secondary?: string;
}

const AuthContainer = styled.div<LayoutProps>`
  --primary: ${(p) => p.primary || "#38c7b9"};
  --secondary: ${(p) => p.secondary || "#1d7269"};
  color: var(--secondary);
  display: flex;
  text-align: center;
  flex-direction: column;
  position: relative;
  font-size: 1.8em;

  & .InnerContainer {
    box-sizing: border-box;
    font-size: 1.2em;
    margin: auto;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  & .User {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
  }

  & .Image {
    height: 45px;
    width: 45px;
    border-radius: 50%;
    margin-right: 1rem;
    border: 1px solid var(--secondary);
  }
  & button {
    width: 100%;
    background: white;
    border: 2px solid var(--primary);
    font-size: inherit;
    max-width: 400px;
    padding: 0.6rem 1.5rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover:enabled {
      color: white;
      background: var(--primary);
    }
  }
  & input {
    margin: 1rem 0rem;
    width: 100%;
    border-radius: 5px;
    height: 40px;
    padding: 10px 10px 10px 10px;
    font-size: inherit;
  }
  .SignOut {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  & .Loader {
    margin: auto;
    border: 10px solid #f3f3f3;
    border-top: 10px solid #3498db;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface Props {
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
  resourceFixed?: string;
  signInLabel?: string;
  signOutLabel?: string;
}

/** Returns an AuthForm component in which the
 * props (fixedResource, user, loading, signIn, signOut)
 * are included via closure. This way,
 * the only props that need to be specified for
 * the auth form are the AuthFormProps
 */
export default function authFormGenerator({
  user,
  loading,
  signIn,
  signOut,
}: Props) {
  const AuthForm = ({
    primary,
    secondary,
    resourceLabel,
    resourceExample,
    resourceSuggestion,
    resourceFixed,
    signInLabel,
    signOutLabel,
  }: AuthFormProps) => {
    function ConditionalRender() {
      if (loading) return <div className="Loader" />;
      if (!user)
        return (
          <SignInForm
            signIn={signIn}
            resourceLabel={resourceLabel}
            resourceExample={resourceExample}
            resourceSuggestion={resourceSuggestion}
            resourceFixed={resourceFixed}
            signInLabel={signInLabel}
          />
        );
      return (
        <SignOutForm
          user={user}
          signOut={signOut}
          signOutLabel={signOutLabel}
        />
      );
    }

    return (
      <AuthContainer primary={primary} secondary={secondary}>
        <div className="InnerContainer">
          <ConditionalRender />
        </div>
      </AuthContainer>
    );
  };

  return memo(AuthForm);
}

interface SignInFormProps {
  signIn: (resource?: string) => void;
  resourceLabel?: string;
  resourceExample?: string;
  resourceSuggestion?: string;
  resourceFixed?: string;
  signInLabel?: string;
}

function SignInForm({
  signIn,
  resourceLabel,
  resourceExample,
  resourceSuggestion,
  resourceFixed,
  signInLabel,
}: SignInFormProps) {
  const [resourceValue, setResourceValue] = useState(
    resourceFixed || resourceSuggestion || ""
  );
  function invalidUrl(url: string) {
    return !/^https?:\/\//.test(url);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signIn(resourceValue);
      }}
    >
      <label>
        <b>{resourceLabel || "Connect to server"}</b>
      </label>
      {resourceFixed ? (
        <p>{resourceFixed}</p>
      ) : (
        <input
          type="url"
          id="url"
          name="url"
          placeholder={resourceExample || "https://amcat-server.example"}
          value={resourceValue}
          onChange={(e) => setResourceValue(e.target.value)}
        />
      )}

      <button disabled={invalidUrl(resourceValue)} type="submit">
        {signInLabel || "Sign-in"}
      </button>
    </form>
  );
}

interface SignOutFormProps {
  user: MiddlecatUser;
  signOut: (signOutMiddlecat: boolean) => void;
  signOutLabel?: string;
}

function SignOutForm({ user, signOut, signOutLabel }: SignOutFormProps) {
  return (
    <>
      <div className="User">
        {user?.image ? (
          <img
            className="Image"
            src={user.image}
            referrer-policy="no-referrer"
            alt=""
          />
        ) : null}
        <div>
          {user?.name || user?.email}
          {user?.name ? (
            <>
              <br />
              <span style={{ fontSize: "0.8em" }}>{user?.email}</span>
            </>
          ) : null}
        </div>
      </div>
      <br />
      <div className="SignOut">
        <button onClick={() => signOut(false)}>
          {signOutLabel || "Sign-out"}
        </button>
        <button onClick={() => signOut(true)}>{"Sign-out MiddleCat"}</button>
      </div>
    </>
  );
}
