import { useContext, useEffect, useState, useRef } from "react";
import { withFirebase } from "./Firebase";
import { AuthUserContext, UpdateUserContext } from "./Session";

import "./AuthPanel.css";

const AuthPanel = ({ firebase }) => {
  const authUser = useContext(AuthUserContext);
  const updateAuthUser = useContext(UpdateUserContext);

  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(
    JSON.parse(window.localStorage.getItem("AuthPanelHidden")) || false
  );
  const [apiKey, setApiKey] = useState("");
  const authPanelEl = useRef(null);

  useEffect(() => {
    if (firebase) {
      setLoading(false);
    }
    if (authUser) {
      setApiKey(authUser.apiKey);
    }
  }, [firebase, authUser]);

  if (loading) return null;

  const toggleAuthPanel = () => {
    window.localStorage.setItem("AuthPanelHidden", JSON.stringify(!hidden));
    setHidden(!hidden);
  };

  const saveApiKey = () => {
    firebase.userAPIKey(authUser.uid).set({ value: apiKey });
    updateAuthUser();
  };

  let Content = null;
  if (authUser)
    Content = () => (
      <>
        <div className="user-info">
          <div>
            <img src={authUser.photoURL} alt="User Profile" />
            <p>Hi {authUser.displayName.split(" ")[0]}!</p>
          </div>

          <button
            className="btn btn-blue btn-small"
            onClick={firebase.doSignOut}
          >
            Logout
          </button>
        </div>
        <div className="apikey-wrapper">
          <label htmlFor="apikey">API Key:</label>
          <input
            type="password"
            name="apikey"
            id="apikey"
            placeholder="XXXXXXX"
            value={apiKey}
            onChange={({ target: { value } }) => setApiKey(value)}
          />
          <button className="btn btn-blue btn-small" onClick={saveApiKey}>
            Save
          </button>
        </div>
        {apiKey === "" && (
          <p>
            Need an API key? Get one{" "}
            <a href="https://smmry.com/api" target="_blank" rel="noreferrer">
              here
            </a>
            !
          </p>
        )}
        <span className="toggle-hidden" onClick={toggleAuthPanel}>
          {hidden ? "▼" : "▲"}
        </span>
      </>
    );
  else
    Content = () => (
      <button className="btn btn-blue btn-small" onClick={firebase.doSignIn}>
        Login
      </button>
    );

  const height = authPanelEl.current ? authPanelEl.current.offsetHeight : 0;
  return (
    <div
      className="AuthPanel"
      ref={authPanelEl}
      style={{ marginTop: hidden ? -1 * height : 0 }}
    >
      <Content />
    </div>
  );
};

export default withFirebase(AuthPanel);
