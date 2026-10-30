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
      content = content.replace(/\|\| "http:\/\/localhost:5001"/g, '|| ""');
      content = content.replace(/\|\| "http:\/\/localhost:5002"/g, '|| ""');
      content = content.replace(/\|\| "http:\/\/localhost:5003"/g, '|| ""');
      content = content.replace(/\|\| "http:\/\/localhost:3001"/g, '|| (typeof window !== "undefined" ? window.location.origin : "")');
      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir(srcDir);
console.log('Frontend URLs updated to relative/same-origin!');
