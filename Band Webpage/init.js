#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'package.json');

if (fs.existsSync(targetFile)) {
    console.log('package.json already exists. Nothing else to initialize.');
} else {
    console.log('Creating package.json...');
    const { execSync } = require('child_process');
    execSync('npm init -y', { stdio: 'inherit', cwd: __dirname });
}
