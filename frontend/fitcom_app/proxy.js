const express = require("express");
const fetch = require("node-fetch");
const cors = require('cors');
const app = express();
const port = 8092;

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).send("Proxy server is running");
});

app.get("/proxy", async (req, res) => {
  const apiUrl = req.query.url;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send(error.toString());
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${port}`);
});