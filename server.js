require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const path = require("path");
const app = express();
const axios = require("axios");
const qs = require("qs");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(favicon(path.join(__dirname, "build", "favicon.ico")));

app.post("/smmry", (req, res) => {
  axios
    .post(
      `https://api.smmry.com/&SM_API_KEY=${process.env.SMMRY_KEY}&SM_LENGTH=${req.body.lines}`,
      qs.stringify({
        sm_api_input: req.body.text,
      }),
      {
        headers: {
          Expect: "100-continue",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((smmry) => res.json(smmry.data));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
