const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');
const srcDir = path.join(__dirname, 'src');

const componentsToFix = [
  'badge',
  'button',
  'card',
  'input',
  'label',
  'separator',
  'sheet',
  'skeleton',
];

// 1. Rename files to PascalCase
componentsToFix.forEach(comp => {
  const lowerFile = path.join(uiDir, `${comp}.jsx`);
  const pascalFile = path.join(uiDir, `${comp.charAt(0).toUpperCase() + comp.slice(1)}.jsx`);

  if (fs.existsSync(lowerFile)) {
    // On Windows, renaming to the same name with different case requires a temp step
    const tempFile = path.join(uiDir, `${comp}.temp.jsx`);
    try {
      fs.renameSync(lowerFile, tempFile);
      fs.renameSync(tempFile, pascalFile);
      console.log(`Renamed ${comp}.jsx to ${comp.charAt(0).toUpperCase() + comp.slice(1)}.jsx`);
    } catch (e) {
      console.log(`Could not rename ${comp}.jsx:`, e.message);
    }
  }
});

// 2. Fix imports in all files
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = walk(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  componentsToFix.forEach(comp => {
    const PascalComp = comp.charAt(0).toUpperCase() + comp.slice(1);
    // Replace exact matches
    const regex = new RegExp(`@/components/ui/${comp}(['"\\/])`, 'g');
    content = content.replace(regex, `@/components/ui/${PascalComp}$1`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
});

console.log('Done fixing casing!');
