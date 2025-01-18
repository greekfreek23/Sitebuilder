/**************************************************************
 1) Install dependencies:
    npm install express cors node-fetch

 2) Create a .env file for your OpenAI API key:
    OPENAI_API_KEY="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"

 3) Run:
    node server.js

 4) This starts an Express server on http://localhost:3000
***************************************************************/

require('dotenv').config();  // for reading OPENAI_API_KEY from .env
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Node 18+ can use built-in 'fetch', but node-fetch is common

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// A simple endpoint to generate DALL·E images
app.post('/generate-dalle', async (req, res) => {
  try {
    const { prompt, n } = req.body;  // e.g. { prompt: "A cute baby sea otter", n: 2 }

    // Make the POST request to OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: n || 1,
        size: '256x256',
      }),
    });

    if (!response.ok) {
      const errDetail = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errDetail.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    // data.data is an array of { url: "..." }
    const urls = data.data.map(item => item.url);
    return res.json({ urls });
  } catch (error) {
    console.error('Error in /generate-dalle:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
