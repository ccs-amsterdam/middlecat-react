import "./App.css";
import useMiddlecat from "./lib/useMiddlecat";

function App() {
  const { user, loading, signIn, signOut } = useMiddlecat(
    "http://thisisfortesting.com"
  );

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
