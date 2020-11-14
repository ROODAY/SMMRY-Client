import { useState, useContext } from "react";
import axios from "axios";
import AuthPanel from "./AuthPanel";
import { withFirebase } from "./Firebase";
import { AuthUserContext } from "./Session";
import swal from "@sweetalert/with-react";
import "./App.css";

const App = ({ firebase }) => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [lines, setLines] = useState(10);
  const [smmry, setSmmry] = useState(null);
  const [sending, setSending] = useState(false);

  const authUser = useContext(AuthUserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    if (url !== "") {
      axios
        .post("/smmry", {
          apiKey: authUser.apiKey,
          url,
          lines,
        })
        .then(({ data }) => {
          if (data.hasOwnProperty("sm_api_error")) {
            swal("Uh oh!", data.sm_api_message, "error");
          } else {
            setSmmry(data);
          }
          setSending(false);
        })
        .catch(console.error);
    } else {
      axios
        .post("/smmry", {
          apiKey: authUser.apiKey,
          text,
          lines,
        })
        .then(({ data }) => {
          if (data.hasOwnProperty("sm_api_error")) {
            swal("Uh oh!", data.sm_api_message, "error");
          } else {
            setSmmry(data);
          }
          setSending(false);
        })
        .catch(console.error);
    }
  };

  const resetForm = () => {
    setText("");
    setUrl("");
    setLines(10);
    setSmmry(null);
    setSending(false);
  };

  const isSubmitDisabled = () => {
    if (sending) return true;
    if (url !== "") return false;
    if (text.length >= 500) return false;
    return true;
  };

  return (
    <div className="App">
      <AuthPanel />
      <header>
        <h1>SMMRY</h1>
      </header>
      <form onSubmit={handleSubmit}>
        {smmry ? (
          <>
            <p className="limit">{smmry.sm_api_limitation}</p>
            <p className="smmry">
              {smmry.sm_api_content
                .replace(/(\[BREAK\] )/g, "\n\n")
                .replace(/(\[BREAK\])/g, "")}
            </p>
            <div className="deets">
              <span>Reduced by {smmry.sm_api_content_reduced}</span>
              <span>{smmry.sm_api_character_count} characters</span>
            </div>
            <button
              className="reset btn btn-blue btn-medium"
              type="button"
              onClick={resetForm}
            >
              New SMMRY
            </button>
          </>
        ) : (
          <>
            <p className="lines">
              Summarize my text in{" "}
              <input
                value={lines}
                onChange={({ target: { value } }) => setLines(value)}
                type="number"
                min="1"
                max="40"
                step="1"
              />{" "}
              sentence{lines > 1 ? "s" : ""}.
            </p>
            <textarea
              className="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="10"
              placeholder="SMMRY summarizes text to save you time.&#10;Paste an article, text, or essay in this box and hit SMMRZ; we'll return a shortened copy for you to read.&#10;You can also summarize online articles and webpages by pasting the URL below (overrides text)..."
            />
            <input
              value={url}
              onChange={({ target: { value } }) => setUrl(value)}
              className="url"
              placeholder="https://somebogusurlhere.com/articlename"
              type="text"
            />
            <button
              className={
                "smmrz btn btn-blue btn-medium" + (sending ? " sending" : "")
              }
              type="submit"
              disabled={isSubmitDisabled()}
            >
              {sending ? "SMMRZNG..." : "SMMRZ"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default withFirebase(App);
