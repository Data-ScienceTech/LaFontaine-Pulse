import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOVABLE_PATTERNS = [
  /made with lovable/gi,
  /powered by lovable/gi,
  /created with lovable/gi,
  /built with lovable/gi,
  /lovable\.ai/gi,
  /<!-- Lovable.*?-->/gs,
  /<.*?data-lovable.*?>/gi,
  /lovable/gi // General catch-all for any remaining references
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
    let originalContent = content;
    
    LOVABLE_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`Found Lovable reference in: ${filePath}`);
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    // Clean up any double spaces or empty lines left behind
    if (modified) {
      content = content
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
        .replace(/  +/g, ' ') // Remove double spaces
        .trim();
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function searchDirectory(dir) {
  const fullDir = path.resolve(dir);
  if (!fs.existsSync(fullDir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }
  
  const items = fs.readdirSync(fullDir);
  
  items.forEach(item => {
    const fullPath = path.join(fullDir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      searchDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.json', '.vue'].includes(ext)) {
        searchAndCleanFile(fullPath);
      }
    }
  });
}

console.log('🧹 Starting Lovable branding cleanup...');
console.log('📁 Searching directories...');

// Change to project root directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

DIRECTORIES_TO_SEARCH.forEach(dir => {
  console.log(`🔍 Searching ${dir}/...`);
  searchDirectory(dir);
});

// Check specific files that commonly contain branding
const commonFiles = [
  'package.json',
  'public/index.html',
  'index.html',
  'README.md',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.tsx'
];

console.log('🔍 Checking common files...');
commonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📄 Checking ${file}...`);
    searchAndCleanFile(file);
  }
});

console.log('✨ Cleanup complete!');
console.log('🔍 Run this command to verify: grep -ri "lovable" . --exclude-dir=node_modules --exclude-dir=.git');
