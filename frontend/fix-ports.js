const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace backend API port 8000 -> 8888
  content = content.replace(/localhost:8000/g, 'localhost:8888');
  content = content.replace(/127\.0\.0\.1:8000/g, '127.0.0.1:8888');

  // Replace frontend port 8080 -> 3002
  content = content.replace(/localhost:8080/g, 'localhost:3002');
  content = content.replace(/127\.0\.0\.1:8080/g, '127.0.0.1:3002');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

console.log('🔧 Fixing port numbers in frontend files...\n');

const srcPath = path.join(__dirname, 'src');
const allFiles = getAllFiles(srcPath);

let changedCount = 0;
allFiles.forEach(file => {
  if (replaceInFile(file)) {
    changedCount++;
    console.log(`✅ ${path.relative(__dirname, file)}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files scanned: ${allFiles.length}`);
console.log(`   Files updated: ${changedCount}`);
console.log(`\n✨ Port fix completed!`);
console.log(`\n⚠️  Review changes before committing:`);
console.log(`   git diff src/`);
