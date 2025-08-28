export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  let count = 0;
  let nextToken = null;
  let tries = 0;

  try {
    do {
      // Build request URL
      let url = `https://api.x.com/2/tweets/search/recent?query=from:${username} @irys_xyz&max_results=100`;
      if (nextToken) {
        url += `&next_token=${nextToken}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      });

      const data = await response.json();

      // If X API returns error
      if (data.errors) {
        return res.status(400).json({ error: data.errors[0].detail });
      }

      // Add to count
      count += data.meta?.result_count || 0;

      // Prepare for next page
      nextToken = data.meta?.next_token || null;

      // Prevent infinite loop (API only allows last 7 days of tweets anyway)
      tries++;
      if (tries > 10) break;

    } while (nextToken);

    return res.status(200).json({ count });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
