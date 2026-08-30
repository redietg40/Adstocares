const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const dirsToWalk = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'lib')
];

let files = [];
dirsToWalk.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walk(dir));
  }
});

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('new PrismaClient()') && !file.includes('prisma.ts')) {
    content = content.replace(/import\s+\{\s*PrismaClient\s*\}\s+from\s+[\"']@prisma\/client[\"'];?/g, '');
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?/g, 'import prisma from "@/lib/prisma";');
    fs.writeFileSync(file, content);
    count++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files updated: ' + count);
