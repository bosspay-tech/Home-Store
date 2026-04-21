const crypto = require('crypto');
const apiKey = "DUMMY_KEY";
const salt = "DUMMY_SALT";
const ts = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString("hex");
const body = { "amount": 10, "collect_ref": "testcollect123" };
const bodyStr = JSON.stringify(body);
const payload = apiKey + ts + nonce + bodyStr;
const sig = crypto.createHmac("sha256", salt).update(payload).digest("hex");
const headers = {
  "Content-Type": "application/json",
  "X-API-KEY": apiKey,
  "X-Timestamp": ts,
  "X-Nonce": nonce,
  "X-Signature": sig
};
const url = "https://nineteenapis.online/api/v2/payments/nsdl/pg";
fetch(url, { method: "POST", headers, body: bodyStr })
  .then(res => res.text())
  .then(text => console.log("PG:", text))
  .catch(console.error);
