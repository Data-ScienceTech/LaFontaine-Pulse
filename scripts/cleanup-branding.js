const fs = require('fs');
const path = require('path');

const LOVABLE_PATTERNS = [
  /made with lovable/gi,
  /powered by lovable/gi,
  /created with lovable/gi,
  /built with lovable/gi,
  /lovable\.ai/gi,
  /<!-- Lovable.*?-->/gs,
  /<.*?data-lovable.*?>/gi
];

const DIRECTORIES_TO_SEARCH = [
  'src',
  'public',
  'docs',
  'components'
];

function searchAndCleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    LOVABLE_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`Found Lovable reference in: ${filePath}`);
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function searchDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      searchDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.json'].includes(ext)) {
        searchAndCleanFile(fullPath);
      }
    }
  });
}

console.log('Starting Lovable branding cleanup...');
DIRECTORIES_TO_SEARCH.forEach(dir => {
  console.log(`Searching ${dir}/...`);
  searchDirectory(dir);
});

// Check specific files that commonly contain branding
const commonFiles = [
  'package.json',
  'public/index.html',
  'README.md',
  'src/App.tsx',
  'src/main.tsx'
];

commonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    searchAndCleanFile(file);
  }
});

console.log('Cleanup complete!');
