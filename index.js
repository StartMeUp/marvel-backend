require("dotenv").config();
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(formidable());
const MD5 = require("crypto-js/md5");

// For example, a user with a public key of "1234" and a private key of "abcd" could construct a valid call as follows:
// http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150
//(the hash value is the md5 digest of 1abcd1234)

const apiUrl = (params) => {
  //console.log("params =>", params);
  const date = new Date();
  const ts = Math.floor(date.getTime() / 1000).toString();

  const keys = `?ts=${ts}&apikey=${process.env.MARVEL_PUBLIC_KEY}&hash=${MD5(
    ts + process.env.MARVEL_PRIVATE_KEY + process.env.MARVEL_PUBLIC_KEY
  )}${params.limit ? "&limit=" + params.limit : ""}${
    params.offset ? "&offset=" + params.offset : ""
  }`;

  const baseUrl = "http://gateway.marvel.com/v1/public/";

  const url = `${baseUrl + params.endpoint}${
    params.id ? "/" + params.id : ""
  }${keys}`;

  //console.log(url);
  return url;
};

app.get("/:endpoint/:id", async (req, res) => {
  try {
    const response = await axios(
      apiUrl({ endpoint: req.params.endpoint, id: req.params.id })
    );
    res.status(200).json(response.data.data.results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/:endpoint", async (req, res) => {
  try {
    const response = await axios(
      apiUrl({
        endpoint: req.params.endpoint,
        limit: req.query.limit,
        offset: req.query.offset,
      })
    );
    res.status(200).json(response.data.data.results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Listening on port 3001");
});
