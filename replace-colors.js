const fs = require('fs');
const path = require('path');

const directory = './src';

// Map of old colors to new colors
const colorMap = {
  // Main Indigo / Blues
  '#4648d4': '#a277ff', // secondary
  '#313bbd': '#8657ea', // slightly darker secondary
  '#6063ee': '#8eb0ff', // secondary-container / light blue
  
  // Dark Navys
  '#131b2e': '#271744', // primary-container / text
  '#111827': '#271744', // Dark gray/navy (tailwind gray-900)
  '#1f2744': '#3d2b5c',
  '#24256f': '#5c3d99', // Dark gradient stop

  // Light Indigos
  '#eef0ff': '#f5edff', // inverse-on-surface / chips
  '#e3e7fb': '#ecdfff', // borders
  '#dfe4ff': '#e6d9ff', // hover states
  '#d8ddf5': '#d4c8e3', // dash border
  '#c6c6cd': '#d4c8e3', // outline-variant
  '#f4f6fb': '#fcfaff', // inputs
  '#faf8ff': '#ffffff', // background
};

// Also create uppercase/mixed-case versions just in case
const replaceMap = {};
for (const [oldHex, newHex] of Object.entries(colorMap)) {
  replaceMap[oldHex.toLowerCase()] = newHex;
  replaceMap[oldHex.toUpperCase()] = newHex;
}

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.css')) {
      files.push(name);
    }
  }
  return files;
}

const allFiles = getFiles(directory);
let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [oldHex, newHex] of Object.entries(replaceMap)) {
    // Regex to match the hex color, ensuring it's not part of a larger hex (e.g. not matching #111827a)
    // Actually, simple global string replace is safer for exact hexes
    // since we use 6-char hexes
    const regex = new RegExp(oldHex, 'g');
    content = content.replace(regex, newHex);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Modified: ${file}`);
    modifiedCount++;
  }
}

console.log(`Done! Modified ${modifiedCount} files.`);
