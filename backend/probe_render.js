const https = require('https');

const candidates = [
  "https://skill-exchange-frontend.onrender.com",
  "https://user-service.onrender.com",
  "https://skill-service.onrender.com",
  "https://exchange-service.onrender.com",
  "https://messaging-service.onrender.com",
  "https://skill-exchange-user.onrender.com",
  "https://skill-exchange-skill.onrender.com",
  "https://skill-exchange-exchange.onrender.com",
  "https://skill-exchange-messaging.onrender.com",
  "https://skill-exchange-backend.onrender.com",
  "https://skill-exchange.onrender.com"
];

candidates.forEach(url => {
  const req = https.get(url, { timeout: 4000 }, res => {
    console.log(`URL: ${url} -> Status: ${res.statusCode}, Server: ${res.headers.server || 'unknown'}`);
  });
  req.on('error', err => {
    console.log(`URL: ${url} -> Error: ${err.message}`);
  });
  req.on('timeout', () => {
    req.destroy();
    console.log(`URL: ${url} -> Timeout`);
  });
});
