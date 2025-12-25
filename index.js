const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api', async (req, res) => {
    let fullUrl = req.query.url;
    if (!fullUrl) return res.json({ error: "TeraBox ലിങ്ക് നൽകുക!" });

    try {
        // 1. ലിങ്കിൽ നിന്ന് ID മാത്രം എടുക്കുന്നു (എല്ലാ ഡൊമെയ്‌നും വർക്ക് ചെയ്യാൻ)
        let shortId = "";
        if (fullUrl.includes("surl=")) {
            shortId = fullUrl.split("surl=")[1];
        } else {
            shortId = fullUrl.split("/").pop();
        }
        
        // ചിലപ്പോൾ ലിങ്കിന്റെ അവസാനം അനാവശ്യമായ ചിഹ്നങ്ങൾ വരാം, അത് ഒഴിവാക്കുന്നു
        shortId = shortId.replace(/[^a-zA-Z0-9_-]/g, "");

        // 2. പബ്ലിക് API വഴി ഫയൽ ഇൻഫർമേഷൻ എടുക്കുന്നു
        // ഇതിൽ കുക്കി ആവശ്യമില്ല
        const apiUrl = `https://terabox-dl.qtcloud.workers.dev/api/get-info?shorturl=${shortId}`;
        
        const response = await axios.get(apiUrl);

        if (response.data && response.data.list && response.data.list.length > 0) {
            const fileData = response.data.list[0];
            
            res.json({
                status: "success",
                domain_detected: new URL(fullUrl).hostname,
                file_name: fileData.server_filename,
                size: (fileData.size / (1024 * 1024)).toFixed(2) + " MB",
                download_link: fileData.dlink
            });
        } else {
            res.json({ 
                status: "error", 
                message: "ഫയൽ കണ്ടെത്താൻ കഴിഞ്ഞില്ല. ലിങ്ക് പരിശോധിക്കുക." 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: "error", 
            message: "API Error: " + error.message 
        });
    }
});

// Koyeb-ന് വേണ്ടി പോർട്ട് സെറ്റിംഗ്സ്
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
