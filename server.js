const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Terabox API is running");
});

/**
 * Usage:
 * /terabox?url=TERABOX_LINK
 */
app.get("/terabox", async (req, res) => {
  const tbUrl = req.query.url;

  if (!tbUrl) {
    return res.status(400).json({
      status: false,
      message: "Terabox URL missing"
    });
  }

  try {
    /**
     * 🔴 IMPORTANT
     * This is a FAST third-party Terabox downloader endpoint.
     * Replace this API if it ever stops working.
     */
    const thirdPartyApi =
      "https://api.dlmate.in/api/terabox?url=" +
      encodeURIComponent(tbUrl);

    const r = await axios.get(thirdPartyApi, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 20000
    });

    // basic validation
    if (!r.data || !r.data.download) {
      return res.json({
        status: false,
        message: "Failed to fetch Terabox link"
      });
    }

    return res.json({
      status: true,
      title: r.data.title || "Terabox File",
      size: r.data.size || "Unknown",
      download: r.data.download
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Terabox service error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Terabox API running on port ${PORT}`);
});
