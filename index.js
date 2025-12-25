const express = require('express');
const axios = require('axios');
const app = express();

const NDUS = "YeE7KKMteHui2PUoNRCuh_LV2QVfRx0oj9siCeDG";

app.get('/api', async (req, res) => {
    let teraboxUrl = req.query.url;
    if (!teraboxUrl) return res.json({ error: "URL is required" });

    try {
        // എല്ലാ തരം ടെറാബോക്സ് ലിങ്കുകളിൽ നിന്നും surl കണ്ടെത്താനുള്ള വഴി
        let surl = "";
        if (teraboxUrl.includes("surl=")) {
            surl = teraboxUrl.split("surl=")[1];
        } else {
            surl = teraboxUrl.split("/").pop().replace("1", "");
        }

        const response = await axios.get(`https://www.terabox.com/share/list?surl=${surl}`, {
            headers: {
                'Cookie': `ndus=${NDUS}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        if (response.data && response.data.list) {
            res.json({
                status: "success",
                file_name: response.data.list[0].server_filename,
                download_link: response.data.list[0].dlink
            });
        } else {
            res.json({ 
                status: "error", 
                message: "ഫയൽ കണ്ടുപിടിക്കാൻ പറ്റിയില്ല. കുക്കി മാറിക്കാണും.",
                debug_surl: surl // എവിടെയാണ് പ്രശ്നമെന്ന് അറിയാൻ
            });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

const PORT = process.env.PORT || 8080; // Koyeb-ന് വേണ്ടി 8080 ആക്കി മാറ്റാം
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
