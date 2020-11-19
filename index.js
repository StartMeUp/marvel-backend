require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());
const MD5 = require("crypto-js/md5");

// For example, a user with a public key of "1234" and a private key of "abcd" could construct a valid call as follows:
// http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150
//(the hash value is the md5 digest of 1abcd1234)

const apiUrl = (params) => {
  const { endpoint1, endpoint2, limit, offset, id } = params;
  const publicKey = process.env.MARVEL_PUBLIC_KEY;
  const privateKey = process.env.MARVEL_PRIVATE_KEY;
  const date = new Date();
  const ts = Math.floor(date.getTime() / 1000).toString();
  const hash = MD5(ts + privateKey + publicKey);

  const keys = `?ts=${ts}&apikey=${publicKey}&hash=${hash}${
    limit ? "&limit=" + limit : ""
  }${offset ? "&offset=" + offset : ""}`;

  const baseUrl = "http://gateway.marvel.com/v1/public/";

  const url = `${baseUrl + endpoint1}${id ? "/" + id : ""}${
    endpoint2 ? "/" + endpoint2 : ""
  }${keys}`;

  //console.log(url);
  return url;
};

app.get("/:endpoint1/:id/:endpoint2", async (req, res) => {
  try {
    const response = await axios(
      apiUrl({
        endpoint1: req.params.endpoint1,
        id: req.params.id,
        endpoint2: req.params.endpoint2,
      })
    );
    res.status(200).json(response.data.data.results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/:endpoint1/:id", async (req, res) => {
  try {
    const response = await axios(
      apiUrl({ endpoint1: req.params.endpoint1, id: req.params.id })
    );
    res.status(200).json(response.data.data.results[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/:endpoint1", async (req, res) => {
  try {
    const response = await axios(
      apiUrl({
        endpoint1: req.params.endpoint1,
        limit: req.query.limit,
        offset: req.query.offset,
      })
    );
    res.status(200).json(response.data.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT);
});
