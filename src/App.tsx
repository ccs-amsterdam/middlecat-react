import { useEffect, useState } from "react";
import "./App.css";
import useMiddlecat from "./lib/useMiddlecat";

function App() {
  const { user, AuthForm } = useMiddlecat();
  const [msg, setMsg] = useState("");

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
        <AuthForm resourceSuggestion="http://localhost:3000/api/demo_resource" />
        <div style={{ color: "grey" }}>
          <p>{msg}</p>
          <p style={{ fontSize: "1.2em" }}>
            {msg &&
              "token is automatically refreshed about 10 seconds before it expires"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
