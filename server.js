const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Terabox API running");
});

// List of third-party Terabox APIs
const TERABOX_APIS = [
  url => `https://api.dlmate.in/api/terabox?url=${encodeURIComponent(url)}`,
  url => `https://api.teraboxdl.xyz/download?url=${encodeURIComponent(url)}`,
  url => `https://terabox-downloader-api.vercel.app/api?url=${encodeURIComponent(url)}`
];

app.get("/terabox", async (req, res) => {
  const tbUrl = req.query.url;
  if (!tbUrl) {
    return res.json({ status: false, message: "URL missing" });
  }

  for (const buildUrl of TERABOX_APIS) {
    try {
      const apiUrl = buildUrl(tbUrl);

      const r = await axios.get(apiUrl, {
        timeout: 20000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      // Try to normalize response
      const download =
        r.data?.download ||
        r.data?.data?.download ||
        r.data?.data?.url ||
        r.data?.url;

      if (download) {
        return res.json({
          status: true,
          title: r.data.title || "Terabox File",
          size: r.data.size || "Unknown",
          download
        });
      }

    } catch (e) {
      // silently try next API
    }
  }

  return res.json({
    status: false,
    message: "All Terabox services failed"
  });
});

app.listen(PORT, () => {
  console.log("🚀 Terabox API with fallback running");
});
