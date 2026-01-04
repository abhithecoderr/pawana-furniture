/**
 * CSS Bundle Script
 *
 * Combines all CSS files into a single bundle.css file.
 * This eliminates 30+ HTTP requests from @import statements.
 *
 * Usage: node scripts/buildCSS.js
 * Run this before deploying to production.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_DIR = path.join(__dirname, '../public/css');
const OUTPUT_FILE = path.join(CSS_DIR, 'bundle.css');
const MAIN_CSS = path.join(CSS_DIR, 'main.css');

// Extract import paths from main.css
function extractImports(content) {
  const importRegex = /@import\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

// Simple CSS minification (no external dependencies)
function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace around selectors and properties
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove whitespace at start/end of lines
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Remove spaces around media query parentheses
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    // Remove last semicolon before closing brace
    .replace(/;}/g, '}')
    // Remove newlines
    .replace(/\n/g, '')
    // Clean up any double spaces
    .replace(/  +/g, ' ')
    .trim();
}

// Read and concatenate all CSS files
function bundleCSS() {
  console.log('🚀 CSS Bundle Script\n');

  // Read main.css
  const mainContent = fs.readFileSync(MAIN_CSS, 'utf8');
  const imports = extractImports(mainContent);

  console.log(`📁 Found ${imports.length} CSS files to bundle\n`);

  let bundledCSS = '';
  let totalSize = 0;

  for (const importPath of imports) {
    const fullPath = path.join(CSS_DIR, importPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Missing: ${importPath}`);
      continue;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const fileSize = Buffer.byteLength(fileContent, 'utf8');
    totalSize += fileSize;

    bundledCSS += fileContent + '\n';
    console.log(`✅ ${importPath} (${(fileSize / 1024).toFixed(1)}KB)`);
  }

  // Minify the bundle
  console.log('\n🔧 Minifying CSS...');
  const minifiedCSS = minifyCSS(bundledCSS);

  // Write bundled file
  fs.writeFileSync(OUTPUT_FILE, minifiedCSS, 'utf8');
  const originalSize = Buffer.byteLength(bundledCSS, 'utf8');
  const minifiedSize = Buffer.byteLength(minifiedCSS, 'utf8');
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log(`📦 Bundle created: bundle.css`);
  console.log(`📊 Original: ${(originalSize / 1024).toFixed(1)}KB`);
  console.log(`📊 Minified: ${(minifiedSize / 1024).toFixed(1)}KB (${savings}% smaller)`);
  console.log('='.repeat(50));
  console.log('\n✨ Done!');
}

bundleCSS();
