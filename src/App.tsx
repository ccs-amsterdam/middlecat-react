import { useEffect, useState } from "react";
import "./App.css";
import useMiddlecat from "./lib/useMiddlecat";

function App() {
  const { user, AuthForm } = useMiddlecat({ storeToken: true });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user?.api) {
      setMsg("");
      return;
    }
    const timer = setInterval(async () => {
      const res = await user.api.post("test");
      setMsg(res.data);
    }, 5000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <div className="Page">
      <div className="Container">
        <AuthForm resourceSuggestion="https://middlecat.up.railway.app/api/demo_resource" />
        <div style={{ color: "grey" }}>
          <p>{msg}</p>
          <p style={{ fontSize: "1.2rem" }}>
            {msg &&
              "Except it doesn't, because token is automatically refreshed about 30 seconds before it expires"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
