import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=from:${username} @irys_xyz&max_results=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!data.data) {
      return res.status(200).json({ count: 0 });
    }

    // Count tweets mentioning @irys_xyz
    const count = data.data.length;

    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
}
