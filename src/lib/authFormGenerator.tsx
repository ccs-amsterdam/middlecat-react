import { memo, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { MiddlecatUser } from "./types";
import { safeURL } from "./util";

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

  .InnerContainer {
    box-sizing: border-box;
    font-size: 1.2em;
    margin: auto;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .User {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
  }

  .Image {
    height: 45px;
    width: 45px;
    border-radius: 50%;
    margin-right: 1rem;
    border: 1px solid var(--secondary);
  }
  button {
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

  input {
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
    margin-top: 1rem;
  }

  .Loader {
    margin: auto;
    border: 10px solid #f3f3f3;
    border-top: 10px solid #3498db;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    height: 3rem;
  }

  .Divider {
    display: flex;
    position: relative;
    margin: 1rem 10px;
    z-index: 2;
  }

  .Divider div {
    margin: auto;
    background: white;
    z-index: 2;
    padding: 0rem 1rem;
    font-size: 0.9em;
  }

  .Divider::after {
    content: "";
    position: absolute;
    bottom: 1rem;
    left: 0;
    width: 100%;
    z-index: 1;
    border-bottom: 2px solid;
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
  error: string;
  signIn: (resource: string, middlecat_url?: string) => void;
  signInGuest: (resource: string, name: string, authDisabled: boolean) => void;
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
  error,
  signIn,
  signInGuest,
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
            signInGuest={signInGuest}
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
          resourceFixed={resourceFixed}
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
        {user ? null : <p>{error}</p>}
      </AuthContainer>
    );
  };

  return memo(AuthForm);
}

interface SignInFormProps {
  signIn: (resource: string, middlecat_url?: string) => void;
  signInGuest: (resource: string, name: string, authDisabled: boolean) => void;
  resourceLabel?: string;
  resourceExample?: string;
  resourceSuggestion?: string;
  resourceFixed?: string;
  signInLabel?: string;
}

interface ResourceConfig {
  resource: string;
  middlecat_url: string;
  allow_guests: boolean;
  named_guest: boolean;
}

function SignInForm({
  signIn,
  signInGuest,
  resourceLabel,
  resourceExample,
  resourceSuggestion,
  resourceFixed,
  signInLabel,
}: SignInFormProps) {
  const [resourceValue, setResourceValue] = useState(
    sessionStorage.getItem("AuthformResource") ||
      resourceFixed ||
      resourceSuggestion ||
      ""
  );
  const [guestName, setGuestName] = useState("");
  const [config, setConfig] = useState<ResourceConfig>();
  const [error, setError] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);

  async function onSubmit(e: any) {
    e.preventDefault();
    setLoadingConfig(true);

    // need to add try catch, because axios throws an error if the server is not reachable
    let res;
    try {
      res = await axios.get(`${safeURL(resourceValue)}/middlecat`, {
        timeout: 5000,
      });
    } catch (e) {
      console.error(e);
    }

    if (!res || res.status !== 200) {
      setError("Could not connect to server");
      setLoadingConfig(false);
      return;
    }

    const auth = res.data.authorization || "allow_guests";

    if (auth === "no_auth") {
      signInGuest(resourceValue, "", true);
      setLoadingConfig(false);
      return;
    }

    const middlecat_url = res.data.middlecat_url || "";
    const allow_guests = auth === "allow_guests";
    const named_guest = !!res.data.named_guest;

    if (!allow_guests && !middlecat_url) {
      setError("Server has invalid authentication configuration");
      setLoadingConfig(false);
      return;
    }

    if (!allow_guests && middlecat_url) {
      signIn(resourceValue, middlecat_url);
      setLoadingConfig(false);
      return;
    }

    if (allow_guests && !named_guest && !middlecat_url) {
      signInGuest(resourceValue, "guest user", false);
      setLoadingConfig(false);
      return;
    }

    setConfig({
      resource: resourceValue,
      middlecat_url,
      allow_guests,
      named_guest,
    });
    setLoadingConfig(false);
  }

  function invalidUrl(url: string) {
    return !/^https?:\/\//.test(url);
  }

  if (loadingConfig) return <div className="Loader" />;

  // There are two steps in the login form. The first is to connect to a server and obtain the server config.
  // Then based on this config the second step is rendered.
  if (config)
    return (
      <div>
        {config.middlecat_url && (
          <button onClick={() => signIn(config.resource, config.middlecat_url)}>
            Sign-in
          </button>
        )}
        {config.allow_guests && (
          <>
            {config.named_guest && config.middlecat_url ? (
              <div className="Divider">
                <div>OR</div>
              </div>
            ) : (
              <div style={{ height: "1rem" }}></div>
            )}
            {config.named_guest && (
              <input
                type="name"
                id="name"
                name="name"
                placeholder={"username (optional)"}
                value={guestName}
                style={{ textAlign: "center" }}
                onChange={(e) => {
                  setGuestName(e.target.value);
                }}
              />
            )}
            <button
              onClick={() =>
                signInGuest(config.resource, guestName || "guest user", false)
              }
            >
              Visit as guest
            </button>
          </>
        )}
      </div>
    );

  return (
    <form onSubmit={onSubmit}>
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
          onChange={(e) => {
            if (error) setError("");
            sessionStorage.setItem("AuthformResource", e.target.value);
            setResourceValue(e.target.value);
          }}
        />
      )}

      <button disabled={invalidUrl(resourceValue)} type="submit">
        {signInLabel || "Sign-in"}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}

interface SignOutFormProps {
  user: MiddlecatUser;
  resourceFixed?: string;
  signOut: (signOutMiddlecat: boolean) => void;
  signOutLabel?: string;
}

function SignOutForm({
  user,
  resourceFixed,
  signOut,
  signOutLabel,
}: SignOutFormProps) {
  const userJSX = (
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
        {user?.name && user?.email ? (
          <>
            <br />
            <span style={{ fontSize: "0.8em" }}>{user?.email}</span>
          </>
        ) : null}
      </div>
    </div>
  );

  if (!user.email) {
    return (
      <>
        {userJSX}

        <div className="SignOut">
          <button onClick={() => signOut(false)}>
            {resourceFixed ? "Reconnect" : "Disconnect"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {userJSX}

      <div className="SignOut">
        <button onClick={() => signOut(false)}>
          {signOutLabel || "Sign-out"}
        </button>
        <button onClick={() => signOut(true)}>{"Sign-out MiddleCat"}</button>
      </div>
    </>
  );
}
