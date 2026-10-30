const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'frontend', 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/VITE_USER_API_URL \|\| \"\"/g, 'VITE_USER_API_URL || \"http://localhost:5001\"');
      content = content.replace(/VITE_SKILL_API_URL \|\| \"\"/g, 'VITE_SKILL_API_URL || \"http://localhost:5002\"');
      content = content.replace(/VITE_EXCHANGE_API_URL \|\| \"\"/g, 'VITE_EXCHANGE_API_URL || \"http://localhost:5003\"');
      content = content.replace(/VITE_MESSAGING_API_URL \|\| [^;)]+/g, 'VITE_MESSAGING_API_URL || \"http://localhost:3001\"');
      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir(srcDir);
console.log('Restored microservices URLs in frontend!');

