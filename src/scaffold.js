const fs = require('fs');
const path = require('path');

// Generate folder structure
module.exports.generateProjectScaffold = (url) => {
  console.log('Generating LEM project structure...');
  let finalPath = url || './';
  fs.cpSync(path.join(__dirname, 'scaffold/'), finalPath, { recursive: true });
  console.log(`Project created at ${finalPath} !`);
}

module.exports.generateExampleFiles = () => {
  
}
