const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 8092;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  next();
});

app.get("/proxy", async (req, res) => {
  const apiUrl = req.query.url; 
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
