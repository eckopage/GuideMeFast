# 🚀 GuideMeFast - Deployment Guide

This guide covers everything you need to deploy and publish GuideMeFast to npm and CDN.

## 📋 Pre-deployment Checklist

### 1. Code Quality
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build process works (`npm run build`)
- [ ] Examples work correctly
- [ ] Documentation is up-to-date

### 2. Version Management
- [ ] Update version in `package.json`
- [ ] Update version in README badges
- [ ] Create changelog entry
- [ ] Update API documentation if needed

### 3. Files and Configuration
- [ ] `.npmignore` is properly configured
- [ ] `package.json` files array is correct
- [ ] All necessary files are included in dist
- [ ] CDN version is minified and optimized

## 🏗 Build Process

### Development Build
```bash
npm run build:watch
```

### Production Build
```bash
npm run build
```

This creates:
- `dist/index.js` - CommonJS version
- `dist/index.esm.js` - ES modules version
- `dist/index.d.ts` - TypeScript definitions
- `dist/material-ui.js` - Material-UI integration
- `dist/vanilla.js` - Vanilla JavaScript version
- `dist/guidemefast.min.js` - CDN-ready minified version
- `dist/index.css` - Compiled styles

### Build Verification
```bash
# Check bundle sizes
npm run build
ls -la dist/

# Test the built package
npm pack
npm install ./guidemefast-1.0.0.tgz
```

## 📦 NPM Publishing

### 1. Prepare for Publishing
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build

# Run all checks
npm run test
npm run lint
npm run type-check

# Test the package
npm pack --dry-run
```

### 2. Update Package Version
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### 3. Publish to NPM
```bash
# Login to npm (first time only)
npm login

# Publish
npm publish

# For beta/alpha releases
npm publish --tag beta
npm publish --tag alpha
```

### 4. Verify Publication
```bash
# Check on npm website
open https://www.npmjs.com/package/guidemefast

# Test installation
npm install guidemefast
```

## 🌐 CDN Deployment

### 1. UnPkg (Automatic)
Once published to npm, your package is automatically available on UnPkg:

```html
<!-- Latest version -->
<script src="https://unpkg.com/guidemefast@latest/dist/guidemefast.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/guidemefast@latest/dist/index.css">

<!-- Specific version -->
<script src="https://unpkg.com/guidemefast@1.0.0/dist/guidemefast.min.js"></script>
```

### 2. jsDelivr (Automatic)
Also automatically available on jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/guidemefast@latest/dist/guidemefast.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/guidemefast@latest/dist/index.css">
```

### 3. Custom CDN Setup
For your own CDN, upload these files:
- `dist/guidemefast.min.js`
- `dist/index.css`
- `dist/guidemefast.min.js.map`
- `dist/index.css.map`

## 🔄 GitHub Actions CI/CD

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build package
        run: npm run build
      
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## Changes
            - Check the [changelog](CHANGELOG.md) for details
          draft: false
          prerelease: false
```

## 📊 Release Process

### 1. Pre-release
```bash
# Create feature branch
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR and merge
```

### 2. Release Preparation
```bash
# Switch to main branch
git checkout main
git pull origin main

# Update changelog
# Update version and create tag
npm version minor -m "chore: bump version to %s"

# Push tags
git push origin main --tags
```

### 3. Post-release
```bash
# Verify npm package
npm view guidemefast

# Verify CDN links
curl -I https://unpkg.com/guidemefast@latest/dist/guidemefast.min.js

# Update documentation site
# Announce release on social media/communities
```

## 🧪 Testing Deployment

### Local Testing
```bash
# Test as CommonJS module
node -e "const gmf = require('./dist/index.js'); console.log(gmf);"

# Test as ES module
node --input-type=module -e "import gmf from './dist/index.esm.js'; console.log(gmf);"

# Test TypeScript definitions
tsc --noEmit --skipLibCheck test-types.ts
```

### Integration Testing
```bash
# Create test project
mkdir test-integration
cd test-integration
npm init -y
npm install guidemefast

# Test React integration
# Test Vanilla JS integration
# Test Material-UI integration
```

## 📈 Monitoring and Analytics

### 1. NPM Download Statistics
- Monitor downloads on npm website
- Use tools like npm-stat for detailed analytics
- Track download trends and popular versions

### 2. CDN Usage Monitoring
- Check UnPkg/jsDelivr statistics
- Monitor error rates and performance
- Track geographical usage patterns

### 3. GitHub Repository Metrics
- Watch stars, forks, and issues
- Monitor pull request activity
- Track community engagement

## 🔒 Security Considerations

### 1. Package Security
```bash
# Audit dependencies
npm audit

# Check for vulnerabilities
npm audit fix

# Use security scanning tools
npm install -g snyk
snyk test
```

### 2. Publishing Security
- Use 2FA for npm account
- Limit publishing access
- Regular security updates
- Monitor for security alerts

### 3. CDN Security
- Use SRI (Subresource Integrity) hashes
- Monitor for unauthorized changes
- Keep dependencies updated

## 🚨 Rollback Procedures

### NPM Rollback
```bash
# Deprecate a version
npm deprecate guidemefast@1.2.0 "Version 1.2.0 deprecated due to critical bug"

# Unpublish (only within 72 hours)
npm unpublish guidemefast@1.2.0
```

### Emergency Hotfix
```bash
# Create hotfix branch from tag
git checkout -b hotfix/critical-fix v1.1.0

# Make fixes
git commit -m "fix: critical security patch"

# Bump patch version
npm version patch

# Publish hotfix
npm publish

# Merge back to main
git checkout main
git merge hotfix/critical-fix
git push origin main --tags
```

## 📋 Post-Deployment Checklist

- [ ] NPM package published successfully
- [ ] CDN links working
- [ ] Documentation updated
- [ ] GitHub release created
- [ ] Social media announcement
- [ ] Update example projects
- [ ] Monitor for issues
- [ ] Update project roadmap

## 🎯 Automation Scripts

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Pre-deployment checks
echo "✅ Running tests..."
npm test

echo "✅ Checking TypeScript..."
npm run type-check

echo "✅ Running linter..."
npm run lint

echo "✅ Building package..."
npm run build

echo "✅ Checking build output..."
ls -la dist/

# Version and publish
echo "📦 Publishing to NPM..."
npm publish

echo "✅ Deployment completed successfully!"
echo "📊 Package available at: https://www.npmjs.com/package/guidemefast"
echo "🌐 CDN available at: https://unpkg.com/guidemefast@latest/"
```

Make it executable:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This deployment guide ensures a smooth, reliable process for publishing and maintaining GuideMeFast in production environments.