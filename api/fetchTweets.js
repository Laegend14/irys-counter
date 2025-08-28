import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    // Step 1: Get user ID from username
    const userResp = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    const userData = await userResp.json();
    if (!userResp.ok || !userData.data) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userData.data.id;
    let count = 0;
    let paginationToken = null;

    // Step 2: Loop through tweets (with pagination)
    do {
      const url = new URL(
        `https://api.twitter.com/2/users/${userId}/tweets`
      );
      url.searchParams.set("max_results", "100"); // fetch up to 100 per request
      if (paginationToken) {
        url.searchParams.set("pagination_token", paginationToken);
      }

      const tweetsResp = await fetch(url, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });

      const tweetsData = await tweetsResp.json();
      if (!tweetsResp.ok) {
        return res.status(500).json({ error: tweetsData });
      }

      if (tweetsData.data) {
        for (const tweet of tweetsData.data) {
          if (tweet.text.toLowerCase().includes("@irys_xyz")) {
            count++;
          }
        }
      }

      paginationToken = tweetsData.meta?.next_token || null;
    } while (paginationToken);

    return res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
