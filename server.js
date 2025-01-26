/*****************************************************************
 * server.js — Node/Express app for eBay webhook verification & handling
 *****************************************************************/
const express = require("express");
const bodyParser = require("body-parser");

// 1. Initialize Express
const app = express();

// 2. Use JSON body parser so we can read incoming JSON payloads
app.use(bodyParser.json());

// 3. The token that you set in the eBay Developer Portal
//    Go to eBay Dev Portal -> "Alerts & Notifications" -> "Verification token"
//    Put the SAME string in your hosting platform's environment variables.
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || "my-secret-token-123";

/***************************************************************
 * POST /ebay-webhook
 * This route handles both:
 *   - eBay’s verification checks (token test)
 *   - Actual account deletion events
 ***************************************************************/
app.post("/ebay-webhook", (req, res) => {
  console.log("Incoming eBay request body:", req.body);

  // 1. Check for verification token
  const incomingToken = req.body.verificationToken;
  if (incomingToken && incomingToken === EBAY_VERIFICATION_TOKEN) {
    // This is the verification handshake attempt from eBay
    console.log(">> eBay verification token matched, responding 200...");
    return res.status(200).send("VERIFICATION_SUCCESS");
  }

  // 2. If not verification, check for an actual "Marketplace Account Deletion" event
  if (req.body.eventName === "MARKETPLACE_ACCOUNT_DELETION") {
    // eBay typically includes user or account info to be deleted in the body
    const userId = req.body.userId || "(unknown user)";
    console.log(`>> Received account deletion event for user: ${userId}`);

    // TODO: Implement your user data deletion / anonymization logic here
    // e.g., find user in your DB and remove or scrub personal info

    return res.status(200).send("Account deletion handled");
  }

  // 3. Otherwise, unrecognized or invalid request
  console.log(">> Unrecognized or invalid request from eBay.");
  return res.status(400).send("INVALID_REQUEST");
});

// 4. Basic GET route to confirm the server is up
app.get("/", (req, res) => {
  res.send("Hello from eBay Webhook Handler!");
});

// 5. Start the server on the correct port
//    Use the port from the hosting provider (Railway, Heroku, etc.) or default 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
