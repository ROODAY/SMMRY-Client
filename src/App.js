import { useState, useContext, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import swal from "@sweetalert/with-react";

import AuthPanel from "./AuthPanel";
import { withFirebase } from "./Firebase";
import { AuthUserContext } from "./Session";
import "./App.css";

Modal.setAppElement("#root");

const App = ({ firebase }) => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [lines, setLines] = useState(10);
  const [smmry, setSmmry] = useState(null);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const authUser = useContext(AuthUserContext);

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const url = urlParams.get("url");
    if (url) {
      const urlObj = new URL(url);
      if (urlObj.host === "www.wired.com") {
        axios.post("/getPage", { url }).then(({ data }) => {
          const el = document.createElement("html");
          el.innerHTML = data;
          const text1 = Array.from(el.querySelectorAll(".article__body>p"))
            .map((t) => t.textContent)
            .join("\n");
          const text2 = Array.from(el.querySelectorAll("article.content>p"))
            .map((t) => t.textContent)
            .join("\n");

          setText(text1 || text2);
          el.remove();
        });
      } else {
        setUrl(url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authUser) {
      return swal(
        "Uh oh!",
        "You need to login and save an API key first!",
        "error"
      );
    }

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

  const readText = () => {
    const cleanText = smmry.sm_api_content
      .replace(/(\[BREAK\] )/g, "\n\n")
      .replace(/(\[BREAK\])/g, "");
    const speech = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(speech);
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
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <span className="clickable" onClick={readText}>
                Read for me
              </span>
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
        <div style={{ marginTop: 20 }}>
          <span
            className="clickable"
            style={{ margin: 10 }}
            onClick={() => {
              const curURL =
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname;
              /* eslint-disable jsx-a11y/anchor-is-valid, no-script-url, no-template-curly-in-string */
              const href =
                "javascript:(function() {const url = location.protocol + '//' + location.host + location.pathname;window.location.href = `" +
                curURL +
                "?url=${url}`})();";
              const bookmarkletAnchor = `
                <a href="${href}">
                      One-click Summary
                    </a>
              `;
              setModalContent(
                <>
                  <h2>Bookmarklet</h2>
                  <p>
                    For one-click summarization, drag this link to your bookmark
                    bar:{" "}
                    <span
                      dangerouslySetInnerHTML={{ __html: bookmarkletAnchor }}
                    />
                    <br />
                    <br />
                    Alternatively copy and paste this code into a bookmark URL:
                  </p>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {"javascript:(function() {const url = location.protocol + '//' + location.host + location.pathname;window.location.href = `" +
                      curURL +
                      "?url=${url}`})();"}
                  </pre>
                  <h2>How to Use</h2>
                  <p>
                    When you find an article you want to summarize, have it
                    present in the focused tab/window, then just click the
                    bookmark once and the article link or text will be loaded
                    here. Then just select the number of lines you want and hit
                    SMMRZ!
                  </p>
                  <button onClick={closeModal}>Close</button>
                </>
              );
              /* eslint-enable jsx-a11y/anchor-is-valid, no-script-url, no-template-curly-in-string */
              setShowModal(true);
            }}
          >
            Bookmarklet
          </span>
          |
          <span
            className="clickable"
            style={{ margin: 10 }}
            onClick={() => {
              setModalContent(
                <>
                  <h2>Privacy Policy</h2>
                  <p>
                    In order for this SMMRY client to work, you must login with
                    a Google account and save your SMMRY API key. The API key
                    gets stored under your account UID in Firebase, and can only
                    be read/modified by you or through the Firebase Admin
                    Console (only accessible by me). Yes, you have to trust that
                    I won't steal your SMMRY key, and you'll just have to take
                    my word for it. If that's not good enough, well this is{" "}
                    <a
                      href="https://github.com/ROODAY/SMMRY-Client"
                      target="_blank"
                      rel="noreferrer"
                    >
                      open source
                    </a>{" "}
                    so you can host it yourself.
                  </p>
                  <button onClick={closeModal}>Close</button>
                </>
              );
              setShowModal(true);
            }}
          >
            Privacy
          </span>
        </div>
      </form>
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          content: {
            position: "relative",
            maxWidth: "500px",
            height: "fit-content",
            inset: 0,
            margin: 10,
          },
        }}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default withFirebase(App);
