#!/bin/bash

# GuideMeFast - NPM Publishing Script
# This script handles the complete publishing process for GuideMeFast

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    log_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

log_info "Starting GuideMeFast publishing process..."

# Step 1: Install dependencies
log_info "Installing dependencies..."
npm ci
log_success "Dependencies installed"

# Step 2: Run tests
log_info "Running tests..."
npm test
if [ $? -ne 0 ]; then
    log_error "Tests failed. Aborting publish."
    exit 1
fi
log_success "All tests passed"

# Step 3: TypeScript type checking
log_info "Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
    log_error "TypeScript type check failed. Aborting publish."
    exit 1
fi
log_success "TypeScript type check passed"

# Step 4: Linting
log_info "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    log_error "Linting failed. Aborting publish."
    exit 1
fi
log_success "Linting passed"

# Step 5: Build
log_info "Building package..."
npm run build
if [ $? -ne 0 ]; then
    log_error "Build failed. Aborting publish."
    exit 1
fi
log_success "Build completed"

# Step 6: Check build output
log_info "Checking build output..."
if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.esm.js" ] || [ ! -f "dist/index.d.ts" ]; then
    log_error "Build output is incomplete. Missing required files."
    exit 1
fi
log_success "Build output verified"

# Step 7: Get current version and ask for new version
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

echo "Select version bump type:"
echo "1) patch (bug fixes)"
echo "2) minor (new features, backwards compatible)"
echo "3) major (breaking changes)"
echo "4) custom version"
echo "5) skip version bump"

read -p "Enter your choice (1-5): " -n 1 -r
echo

NEW_VERSION=""
case $REPLY in
    1)
        log_info "Bumping patch version..."
        NEW_VERSION=$(npm version patch --no-git-tag-version)
        ;;
    2)
        log_info "Bumping minor version..."
        NEW_VERSION=$(npm version minor --no-git-tag-version)
        ;;
    3)
        log_info "Bumping major version..."
        NEW_VERSION=$(npm version major --no-git-tag-version)
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        if [[ ! $CUSTOM_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+.*$ ]]; then
            log_error "Invalid version format. Use semver format (e.g., 1.2.3)."
            exit 1
        fi
        npm version $CUSTOM_VERSION --no-git-tag-version
        NEW_VERSION="v$CUSTOM_VERSION"
        ;;
    5)
        log_info "Skipping version bump..."
        NEW_VERSION="v$CURRENT_VERSION"
        ;;
    *)
        log_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

if [ -n "$NEW_VERSION" ] && [ "$NEW_VERSION" != "v$CURRENT_VERSION" ]; then
    log_success "Version bumped to $NEW_VERSION"
fi

# Step 8: Test package locally
log_info "Testing package locally..."
npm pack --dry-run > /dev/null 2>&1
if [ $? -ne 0 ]; then
    log_error "Package creation test failed."
    exit 1
fi
log_success "Package test completed"

# Step 9: Check npm authentication
log_info "Checking npm authentication..."
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    log_error "Not logged in to npm. Please run 'npm login' first."
    exit 1
fi
NPM_USER=$(npm whoami)
log_success "Authenticated as: $NPM_USER"

# Step 10: Final confirmation
PACKAGE_NAME=$(node -p "require('./package.json').name")
FINAL_VERSION=$(node -p "require('./package.json').version")

echo
log_warning "Final confirmation:"
echo "Package: $PACKAGE_NAME"
echo "Version: $FINAL_VERSION"
echo "NPM User: $NPM_USER"
echo "Branch: $CURRENT_BRANCH"
echo
read -p "Are you sure you want to publish? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Publishing cancelled."
    # Revert version changes if any
    if [ "$NEW_VERSION" != "v$CURRENT_VERSION" ]; then
        git checkout -- package.json
        log_info "Version changes reverted."
    fi
    exit 0
fi

# Step 11: Commit version changes (if any)
if [ "$NEW_VERSION" != "v$CURRENT_VERSION" ]; then
    log_info "Committing version changes..."
    git add package.json
    git commit -m "chore: bump version to $FINAL_VERSION"
    git tag "$NEW_VERSION"
    log_success "Version committed and tagged"
fi

# Step 12: Publish to npm
log_info "Publishing to npm..."

# Check if it's a pre-release version
if [[ $FINAL_VERSION =~ (alpha|beta|rc) ]]; then
    TAG="next"
    log_info "Publishing as pre-release with tag: $TAG"
    npm publish --tag $TAG
else
    npm publish
fi

if [ $? -ne 0 ]; then
    log_error "npm publish failed."
    # Clean up git changes if publish failed
    if [ "$NEW_VERSION" != "v$CURRENT_VERSION" ]; then
        git tag -d "$NEW_VERSION"
        git reset --hard HEAD~1
        log_info "Git changes reverted due to publish failure."
    fi
    exit 1
fi

log_success "Package published successfully!"

# Step 13: Push changes to remote
if [ "$NEW_VERSION" != "v$CURRENT_VERSION" ]; then
    log_info "Pushing changes to remote repository..."
    git push origin $CURRENT_BRANCH
    git push origin $NEW_VERSION
    log_success "Changes pushed to remote"
fi

# Step 14: Verify publication
log_info "Verifying publication..."
sleep 5 # Wait a moment for npm to propagate
npm view $PACKAGE_NAME@$FINAL_VERSION > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log_success "Package verified on npm registry"
else
    log_warning "Package verification failed, but this might be due to propagation delay"
fi

# Step 15: Generate release notes
log_info "Generating release summary..."

echo
echo "🎉 Publication Summary:"
echo "======================="
echo "Package: $PACKAGE_NAME"
echo "Version: $FINAL_VERSION"
echo "NPM Registry: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "CDN (unpkg): https://unpkg.com/$PACKAGE_NAME@$FINAL_VERSION/"
echo "CDN (jsDelivr): https://cdn.jsdelivr.net/npm/$PACKAGE_NAME@$FINAL_VERSION/"
echo

# Step 16: Post-publish tasks
echo "📋 Post-publish checklist:"
echo "- [ ] Update documentation website"
echo "- [ ] Create GitHub release"
echo "- [ ] Update example projects"
echo "- [ ] Announce on social media/communities"
echo "- [ ] Monitor for issues"
echo "- [ ] Update changelog"

# Optional: Open relevant URLs
read -p "Open npm package page in browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open > /dev/null; then
        open "https://www.npmjs.com/package/$PACKAGE_NAME"
    elif command -v xdg-open > /dev/null; then
        xdg-open "https://www.npmjs.com/package/$PACKAGE_NAME"
    else
        log_info "Please visit: https://www.npmjs.com/package/$PACKAGE_NAME"
    fi
fi

log_success "Publishing process completed successfully!"
echo
echo "🚀 Your package is now available for installation:"
echo "   npm install $PACKAGE_NAME"
echo
echo "📖 Remember to update your documentation and examples!"

exit 0