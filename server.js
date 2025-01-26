/*****************************************************************
 * server.js — Updated to return the challenge_code for eBay's validation
 *****************************************************************/
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// The token used for POST verification, as before:
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || "my-secret-token-12345ser543tywer";

//
// --- GET /ebay-webhook ---
//
app.get("/ebay-webhook", (req, res) => {
  console.log("GET /ebay-webhook query:", req.query);

  // eBay typically sends a "challenge_code" parameter during verification
  const challengeCode = req.query.challenge_code;

  if (challengeCode) {
    // Respond with that exact challenge code so eBay knows we're valid
    console.log(`>> Responding with challengeCode: ${challengeCode}`);
    return res.status(200).send(challengeCode);
  }

  // If no challenge_code is present, just respond with a basic message
  return res.status(200).send("GET endpoint is alive, but no challenge_code provided.");
});

//
// --- POST /ebay-webhook --- (unchanged from your existing code)
//
app.post("/ebay-webhook", (req, res) => {
  console.log("Incoming eBay request body:", req.body);

  // 1. Check for verification token
  const incomingToken = req.body.verificationToken;
  if (incomingToken && incomingToken === EBAY_VERIFICATION_TOKEN) {
    console.log(">> eBay verification token matched, responding 200...");
    return res.status(200).send("VERIFICATION_SUCCESS");
  }

  // 2. If not verification, handle "MARKETPLACE_ACCOUNT_DELETION"
  if (req.body.eventName === "MARKETPLACE_ACCOUNT_DELETION") {
    const userId = req.body.userId || "(unknown user)";
    console.log(`>> Received account deletion event for user: ${userId}`);
    // ...handle deletion...
    return res.status(200).send("Account deletion handled");
  }

  // 3. Otherwise, unrecognized or invalid request
  console.log(">> Unrecognized or invalid request from eBay.");
  return res.status(400).send("INVALID_REQUEST");
});

// Basic root for health check
app.get("/", (req, res) => {
  res.send("Hello from eBay Webhook Handler!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
