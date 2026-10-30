const fs = require('fs');
let file = 'backend/services/exchange-service/server.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/http:\/\/localhost:5002/g, "${process.env.SKILL_SERVICE_URL || 'http://localhost:5002'}");
fs.writeFileSync(file, content);
console.log('Fixed exchange-service internal URL');
