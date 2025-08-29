export default async function handler(req, res) {
  const { username } = req.query; // we’ll get ?username=... from frontend

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Twitter API endpoint
    const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${username} @irys_xyz&max_results=100`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`, // your secret
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      return res.status(response.status).json({ error: errorDetails });
    }

    const data = await response.json();

    // Count tweets
    const count = data.meta?.result_count || 0;

    return res.status(200).json({ username, count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
