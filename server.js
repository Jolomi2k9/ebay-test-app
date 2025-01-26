const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// A sample POST endpoint for webhooks (or any request)
app.post("/webhook", (req, res) => {
  console.log("Received webhook payload:", req.body);
  // Respond with 200 OK
  res.status(200).send("Received");
});

// Default GET route, just for sanity check
app.get("/", (req, res) => {
  res.send("Hello from Heroku webhook handler!");
});

// Use the PORT that Heroku provides or default to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
