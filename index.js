const express = require('express');
const axios = require('axios');
const app = express();

// നിങ്ങളുടെ ndus കുക്കി ഇവിടെ നൽകുക
const NDUS = "YeE7KKMteHuihpGN5IBrJ7kBc8vs7WkKj5BsQsqS";

app.get('/api', async (req, res) => {
    const teraboxUrl = req.query.url;
    if (!teraboxUrl) return res.json({ error: "URL is required" });

    try {
        const surl = teraboxUrl.split('surl=')[1] || teraboxUrl.split('/').pop();
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
            res.json({ status: "error", message: "File not found or Cookie expired" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
          
