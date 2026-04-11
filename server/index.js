const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const lowercaseMsg = message.trim().toLowerCase();
  let reply = "I'm still learning. Try saying 'hello'.";
  let action = null;
  let url = null;

  if (lowercaseMsg.includes('play')) {
    let cleanMsg = lowercaseMsg.replace(/[^a-z0-9\s]/g, '');
    cleanMsg = cleanMsg.replace(/open\s+s?portify\s+and\s+/g, '');
    
    let match = cleanMsg.match(/play\s+(?:music\s+|song\s+)?(.+)/);
    if (match && match[1] && match[1].trim() !== '') {
      let songName = match[1].trim();
      url = `https://open.spotify.com/search/${encodeURIComponent(songName)}`;
      reply = `Searching for ${songName} on Spotify!`;
      action = "open_url";
    } else {
      url = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
      reply = "Opening Spotify top hits!";
      action = "open_url";
    }
  } else if (lowercaseMsg.includes('open')) {
    let cleanMsg = lowercaseMsg.replace(/[^a-z0-9\s]/g, ''); // strip punctuation
    let match = cleanMsg.match(/open\s+(the\s+)?([a-z0-9]+)/);
    
    if (match) {
      let appName = match[2];
      if (appName === "sportify") appName = "spotify"; // common typo
      
      const urls = {
        youtube: "https://www.youtube.com",
        google: "https://www.google.com",
        instagram: "https://www.instagram.com",
        twitter: "https://twitter.com",
        facebook: "https://www.facebook.com",
        github: "https://github.com",
        reddit: "https://www.reddit.com",
        spotify: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits playlist
        netflix: "https://www.netflix.com",
      };
      
      url = urls[appName] || `https://www.${appName}.com`;
      reply = `Opening ${appName}!`;
      action = "open_url";
    }
  } else if (lowercaseMsg.includes('hello')) {
    reply = "Hello! Try asking me: 'tell me a joke' or 'i feel stressed'.";
  } else if (lowercaseMsg.includes('tell me a joke')) {
    const jokes = [
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "I told my computer a joke, but it didn't get it. It lacked the necessary byte.",
      "Parallel lines have so much in common. It's a shame they'll never meet."
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
  } else if (lowercaseMsg.includes('i feel stressed')) {
    reply = "STRESS MODE ACTIVATED! You forgot to submit that important report! Just kidding. Take a deep breath, relax your shoulders, and remember that you're doing great!";
  }

  res.json({ reply, action, url });
});

app.listen(port, () => {
  console.log(`Voice assistant backend listening on port ${port}`);
});
