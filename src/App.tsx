import { useEffect } from "react";
import "./App.css";
import useMiddlecat from "./lib/useMiddlecat";

function App() {
  const { user, loading, signIn, signOut } = useMiddlecat(
    "http://localhost:3000" // for testing locally this should be a middlecat server
  );

  useEffect(() => {
    if (!user?.api) return;
    const timer = setInterval(async () => {
      const res = await user.api.post("/api/testRefresh");
      console.log(res.data);
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  const ConditionalRender = () => {
    if (loading) return <div className="Loader" />;
    if (!user) return <button onClick={() => signIn()}>Sign-in</button>;
    return (
      <div>
        <div className="User">
          <img className="Image" src={user?.image} alt="profile " />
          <div>
            {user?.name}
            <br />
            <span style={{ fontSize: "1.2rem" }}>{user?.email}</span>
          </div>
        </div>
        <br />
        <button onClick={() => signOut()}>Sign-out</button>
      </div>
    );
  };

  return (
    <div className="Page">
      <div className="Container">
        <ConditionalRender />
      </div>
    </div>
  );
}

export default App;
