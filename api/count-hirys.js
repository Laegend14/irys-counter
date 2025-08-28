// /api/count-hirys.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Twitter API credentials
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // store in Vercel env vars

  if (!BEARER_TOKEN) {
    return res.status(500).json({ error: "Twitter API token not configured" });
  }

  let totalCount = 0;
  let nextToken = null;
  let requests = 0;

  try {
    do {
      // Build Twitter API query
      const url = new URL("https://api.twitter.com/2/tweets/search/recent");
      url.searchParams.append("query", `from:${username} hirys`);
      url.searchParams.append("tweet.fields", "text");
      url.searchParams.append("max_results", "100"); // maximum allowed
      if (nextToken) {
        url.searchParams.append("next_token", nextToken);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData.error || "Twitter API error" });
      }

      const data = await response.json();

      // Count "hirys" matches in tweets (case insensitive)
      if (data.data) {
        data.data.forEach(tweet => {
