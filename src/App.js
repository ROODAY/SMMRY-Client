import { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [text, setText] = useState("");
  const [lines, setLines] = useState(7);
  const [smmry, setSmmry] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post("/smmry", {
        text,
        lines,
      })
      .then(({ data }) => {
        setSmmry(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SMMRY</h1>
      </header>
      <form onSubmit={handleSubmit}>
        {smmry ? (
          <>
            <p className="limit">{smmry.sm_api_limitation}</p>
            <p className="smmry">
              {smmry.sm_api_content.split(". ").join(". \n\n")}
            </p>
            <div className="deets">
              <span>Reduced by {smmry.sm_api_content_reduced}</span>
              <span>{smmry.sm_api_character_count} characters</span>
            </div>
            <button
              className="reset btn btn-blue btn-medium"
              type="button"
              onClick={() => setSmmry(null)}
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
                onChange={(e) => setLines(e.target.value)}
                type="number"
                min="1"
                max="40"
                step="1"
              />{" "}
              sentence{lines > 1 ? "s" : ""}
            </p>
            <textarea
              className="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="10"
              placeholder="Source text..."
            />
            <button
              className="smmrz btn btn-blue btn-medium"
              type="submit"
              disabled={text === "" || text.length < 500 || loading}
            >
              {loading ? "SMMRZNG..." : "SMMRZ"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default App;
