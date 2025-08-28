export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await fetch(
      `https://api.x.com/2/tweets/search/recent?query=from:${username} @irys_xyz&max_results=1000`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ error: data.errors[0].detail });
    }

    const count = data.meta?.result_count || 0;

    return res.status(200).json({ count });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
