const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api', async (req, res) => {
    let fullUrl = req.query.url;
    if (!fullUrl) return res.json({ error: "TeraBox ലിങ്ക് നൽകുക!" });

    // എല്ലാ ഡൊമെയ്‌നുകളിൽ നിന്നും ID വേർതിരിച്ചെടുക്കുന്നു
    let shortId = "";
    try {
        if (fullUrl.includes("surl=")) {
            shortId = fullUrl.split("surl=")[1];
        } else {
            shortId = fullUrl.split("/").pop().replace(/^1/, "");
        }
    } catch (e) {
        return res.json({ status: "error", message: "Invalid URL Format" });
    }

    // പരീക്ഷിക്കാൻ പോകുന്ന 2 വ്യത്യസ്ത API-കൾ
    const apiEndpoints = [
        `https://terabox-downloader-seven.vercel.app/api?url=${fullUrl}`,
        `https://terabox-dl.qtcloud.workers.dev/api/get-info?shorturl=${shortId}`
    ];

    for (let apiUrl of apiEndpoints) {
        try {
            const response = await axios.get(apiUrl, { timeout: 10000 });
            
            // ആദ്യത്തെ API വിജയിച്ചാൽ അത് റിട്ടേൺ ചെയ്യുന്നു
            if (response.data && (response.data.list || response.data.download_link)) {
                const data = response.data.list ? response.data.list[0] : response.data;
                return res.json({
                    status: "success",
                    file_name: data.server_filename || data.name,
                    download_link: data.dlink || data.download_link,
                    size: data.size ? (data.size / (1024 * 1024)).toFixed(2) + " MB" : "Unknown"
                });
            }
        } catch (error) {
            console.log(`Trying next API... Error on ${apiUrl}`);
            continue; // അടുത്ത API പരീക്ഷിക്കുന്നു
        }
    }

    res.json({ 
        status: "error", 
        message: "ക്ഷമിക്കണം, എല്ലാ സെർവറുകളും ഇപ്പോൾ ബിസിയാണ്. അല്പം കഴിഞ്ഞ് ശ്രമിക്കൂ." 
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
