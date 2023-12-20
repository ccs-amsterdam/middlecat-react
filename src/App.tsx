import { useEffect, useState } from "react";
import "./App.css";
import { MiddlecatProvider, useMiddlecat } from "./lib/MiddlecatProvider";
import AuthForm from "./lib/AuthForm";

function App() {
  return (
    <MiddlecatProvider
      storeToken={true}
      resourceRequired={true}
      // fixedResource="https://middlecat.up.railway.app/api/demo_resource"
      loginModalProps={{ fontSize: "1.5em", title: "test" }}
    >
      <Demo />
    </MiddlecatProvider>
  );
}

function Demo() {
  const { user } = useMiddlecat();
  const [msg, setMsg] = useState("");
  const { signInGuest } = useMiddlecat();

  useEffect(() => {
    if (!user?.api) {
      setMsg("");
      return;
    }
    const timer = setInterval(async () => {
      try {
        const res = await user.api.post("test");
        setMsg(res.data);
      } catch (e) {
        setMsg(`Could not validate token`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <div className="Page">
      <div className="Container">
        <AuthForm
          resourceSuggestion="https://middlecat.up.railway.app/api/demo_resource"
          fontSize="1.5em"
        />
        <div style={{ color: "grey" }}>
          <p>{user && !user.email ? "Signed in as guest" : null}</p>
          <p>{msg || "..."}</p>
          <p style={{ fontSize: "1.2em" }}>
            {msg &&
              msg !== "Unauthenticated" &&
              "token is automatically refreshed about 10 seconds before it expires"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
