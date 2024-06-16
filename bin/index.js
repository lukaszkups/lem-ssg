#! /usr/bin/env node
const { generateProjectScaffold } = require('./../src/scaffold.js');

const params = process.argv.slice(2);

console.log('Hello, CLI world!', params);

params.forEach((param) => {
  if (param === 'scaffold') {
    generateProjectScaffold()
  }
})
