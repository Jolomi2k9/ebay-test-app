/*****************************************************************
 * server.js — Node/Express app for eBay webhook verification & handling
 *****************************************************************/
const express = require("express");
const bodyParser = require("body-parser");

// 1. Initialize Express
const app = express();

// 2. Use JSON body parser so we can read incoming JSON payloads
app.use(bodyParser.json());

// 3. eBay Verification Token (must match what's in eBay Dev Portal)
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || "my-secret-token-12345ser543tywer";

/***************************************************************
 * GET /ebay-webhook
 * eBay may send a GET request to validate the endpoint existence.
 ***************************************************************/
app.get("/ebay-webhook", (req, res) => {
  // Respond with 200 so eBay sees the endpoint is alive
  console.log("GET request on /ebay-webhook (likely eBay validation).");
  return res.status(200).send("GET endpoint is alive");
});

/***************************************************************
 * POST /ebay-webhook
 * This route handles:
 *   - eBay's verification checks (token test) via POST
 *   - Actual account deletion events
 ***************************************************************/
app.post("/ebay-webhook", (req, res) => {
  console.log("Incoming eBay request body:", req.body);

  // 1. Check for verification token
  const incomingToken = req.body.verificationToken;
  if (incomingToken && incomingToken === EBAY_VERIFICATION_TOKEN) {
    console.log(">> eBay verification token matched, responding 200...");
    return res.status(200).send("VERIFICATION_SUCCESS");
  }

  // 2. If not verification, check for an actual "Marketplace Account Deletion" event
  if (req.body.eventName === "MARKETPLACE_ACCOUNT_DELETION") {
    const userId = req.body.userId || "(unknown user)";
    console.log(`>> Received account deletion event for user: ${userId}`);

    // TODO: Implement your user data deletion / anonymization logic here
    return res.status(200).send("Account deletion handled");
  }

  // 3. Otherwise, unrecognized or invalid request
  console.log(">> Unrecognized or invalid request from eBay.");
  return res.status(400).send("INVALID_REQUEST");
});

// 4. Basic GET route at the root for a simple health check
app.get("/", (req, res) => {
  res.send("Hello from eBay Webhook Handler!");
});

// 5. Start the server on the correct port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
