import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const url = `https://api.x.com/2/tweets/search/recent?query=from:${username} @irys_xyz&tweet.fields=author_id`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }

    const count = data.meta?.result_count || 0;

    return res.status(200).json({
      username,
      count,
      tweets: data.data || [],
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
