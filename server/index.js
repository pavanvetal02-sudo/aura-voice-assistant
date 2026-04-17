const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sara AI Backend is running with OpenAI! 🚀');
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const lowercaseMsg = message.trim().toLowerCase();
  let action = null;
  let url = null;

  // 1. Check for immediate local commands (faster than AI for simple tasks)
  if (lowercaseMsg.includes('play')) {
    let cleanMsg = lowercaseMsg.replace(/[^a-z0-9\s]/g, '');
    let match = cleanMsg.match(/play\s+(?:music\s+|song\s+)?(.+)/);
    if (match && match[1]) {
      let songName = match[1].trim();
      url = `https://open.spotify.com/search/${encodeURIComponent(songName)}`;
      action = "open_url";
    }
  } else if (lowercaseMsg.includes('open')) {
    const urls = {
      youtube: "https://www.youtube.com",
      google: "https://www.google.com",
      instagram: "https://www.instagram.com",
      twitter: "https://twitter.com",
      spotify: "https://open.spotify.com",
      github: "https://github.com",
    };
    for (const [key, value] of Object.entries(urls)) {
      if (lowercaseMsg.includes(key)) {
        url = value;
        action = "open_url";
        break;
      }
    }
  }

  try {
    // 2. Use OpenAI for the actual conversation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are Sara, a futuristic, energetic, and extremely helpful AI assistant. You must ALWAYS address the user as 'Pavan sir'. For every response, you should start with 'Yes Pavan sir,' or naturally include 'Pavan sir'. Keep your responses concise (under 3 sentences) but very friendly. Use emojis occasionally." 
        },
        { role: "user", content: message }
      ],
      max_tokens: 150,
    });

    const reply = completion.choices[0].message.content;

    res.json({ 
      reply, 
      action, 
      url 
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ 
      reply: "I'm having a little trouble connecting to my brain right now. Can you try again? 😅",
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Sara is online and powered by OpenAI on port ${port}`);
});
