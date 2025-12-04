#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log('Starting release process for version', version);

try {
  console.log('Adding all changes to git...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('Committing changes...');
  execSync(`git commit -m "Release version ${version}"`, { stdio: 'inherit' });

  console.log('Checking if git tag exists...');
  const tagExists = execSync(`git tag -l v${version}`).toString().trim() === `v${version}`;
  
  if (tagExists) {
    console.log('Git tag already exists, updating it...');
    execSync(`git tag -d v${version}`, { stdio: 'inherit' });
  }
  
  console.log('Creating git tag...');
  execSync(`git tag v${version}`, { stdio: 'inherit' });

  console.log('Pushing to origin...');
  execSync('git push', { stdio: 'inherit' });

  console.log('Pushing tags to origin...');
  execSync('git push --tags --force', { stdio: 'inherit' });

  console.log('\n✅ Release completed successfully!');
  console.log(`Version ${version} has been committed, tagged, and pushed to GitHub.`);
} catch (error) {
  console.error('❌ Release process failed:', error.message);
  process.exit(1);
}