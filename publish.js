#!/usr/bin/env node
import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const packageJsonPath = path.join(__dirname, 'package.json')
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
let version = packageJson.version

// 获取版本递增类型（major/minor/patch）
const versionType = process.argv[2] || 'patch'

// 自动递增版本号
function incrementVersion(version, type) {
  const parts = version.split('.').map(Number)

  switch (type) {
    case 'major':
      parts[0]++
      parts[1] = 0
      parts[2] = 0
      break
    case 'minor':
      parts[1]++
      parts[2] = 0
      break
    case 'patch':
      parts[2]++
      break
    default:
      console.error('Invalid version type. Use major, minor, or patch.')
      process.exit(1)
  }

  return parts.join('.')
}

// 更新版本号
const newVersion = incrementVersion(version, versionType)
packageJson.version = newVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log(`Starting release process for version ${version} → ${newVersion}`)

try {
  console.log('Adding all changes to git...')
  execSync('git add .', {stdio: 'inherit'})

  console.log('Committing changes...')
  execSync(`git commit -m "Release version ${newVersion}"`, {stdio: 'inherit'})

  console.log('Checking if git tag exists...')
  const tagExists =
    execSync(`git tag -l v${newVersion}`)
      .toString()
      .trim() === `v${newVersion}`

  if (tagExists) {
    console.log('Git tag already exists, updating it...')
    execSync(`git tag -d v${newVersion}`, {stdio: 'inherit'})
  }

  console.log('Creating git tag...')
  execSync(`git tag v${newVersion}`, {stdio: 'inherit'})

  console.log('Pushing to origin...')
  execSync('git push', {stdio: 'inherit'})

  console.log('Pushing tags to origin...')
  execSync('git push --tags --force', {stdio: 'inherit'})

  console.log('\n✅ Release completed successfully!')
  console.log(
    `Version ${newVersion} has been committed, tagged, and pushed to GitHub.`
  )
} catch (error) {
  console.error('❌ Release process failed:', error.message)
  process.exit(1)
}
