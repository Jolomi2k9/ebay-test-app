/*****************************************************************
 * server.js — Responds correctly to eBay's GET verification for account deletion
 *****************************************************************/
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto"); // for createHash('sha256')

const app = express();
app.use(bodyParser.json());

// IMPORTANT: Your eBay verification token must be 32-80 characters, 
// only alphanumeric, underscore (_), or hyphen (-).
// Make sure the token in eBay Dev Portal matches this EXACT string and 
// meets their character requirements.
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || "my-secret-token-12345ser543tywer";

// The EXACT endpoint eBay is calling, as you entered in the Dev Portal.
// Make sure you match the case, path, protocol (https), and domain:
const EBAY_ENDPOINT_URL = process.env.EBAY_ENDPOINT_URL || "https://ebay-test-app-production.up.railway.app/ebay-webhook";

/**
 * GET /ebay-webhook
 * eBay sends a GET request with ?challenge_code=XYZ for verification.
 * We must:
 *   1. SHA-256( challengeCode + verificationToken + endpointURL )
 *   2. Return { "challengeResponse": "<that-hex-hash>" } in JSON.
 */
app.get("/ebay-webhook", (req, res) => {
  console.log("GET /ebay-webhook query:", req.query);

  const challengeCode = req.query.challenge_code;
  if (!challengeCode) {
    // eBay might do a plain GET without a challenge_code. That's fine.
    return res.status(200).send("GET endpoint is alive, but no challenge_code provided.");
  }

  // 1. Create the SHA-256 hash of [challengeCode + verificationToken + endpointURL]
  const hash = crypto.createHash("sha256");
  hash.update(challengeCode);         // from eBay query param
  hash.update(EBAY_VERIFICATION_TOKEN);  // your token
  hash.update(EBAY_ENDPOINT_URL);        // EXACT callback URL eBay is hitting
  const responseHash = hash.digest("hex");

  // 2. Return the hash in JSON with "challengeResponse"
  //    Also set the Content-Type to application/json. Express's res.json() does that automatically.
  console.log(`>> Responding with challengeResponse: ${responseHash}`);
  return res.status(200).json({ challengeResponse: responseHash });
});

/**
 * POST /ebay-webhook
 * For actual notifications:
 *   - eBay sends verificationToken in the body for final check, or
 *   - If eventName = MARKETPLACE_ACCOUNT_DELETION, handle user data deletion.
 */
app.post("/ebay-webhook", (req, res) => {
  console.log("Incoming eBay request body:", req.body);

  // 1. If this is the POST-based token check:
  const incomingToken = req.body.verificationToken;
  if (incomingToken && incomingToken === EBAY_VERIFICATION_TOKEN) {
    console.log(">> eBay verification token matched, responding 200...");
    return res.status(200).send("VERIFICATION_SUCCESS");
  }

  // 2. If not a token check, handle actual account deletion event
  if (req.body.eventName === "MARKETPLACE_ACCOUNT_DELETION") {
    const userId = req.body.userId || "(unknown user)";
    console.log(`>> Received account deletion event for user: ${userId}`);
    // TODO: Implement your data deletion / anonymization logic here
    return res.status(200).send("Account deletion handled");
  }

  // 3. Otherwise, unrecognized or invalid request
  console.log(">> Unrecognized or invalid request from eBay.");
  return res.status(400).send("INVALID_REQUEST");
});

// A simple GET on root for a health check
app.get("/", (req, res) => {
  res.send("Hello from eBay Webhook Handler!");
});

// Listen on the port assigned by Railway or fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
