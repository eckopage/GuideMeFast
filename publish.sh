#!/bin/bash

# GuideMeFast - Emergency Rollback Script
# This script handles emergency rollbacks to previous versions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

log_highlight() {
    echo -e "${CYAN}🎯 $1${NC}"
}

log_emergency() {
    echo -e "${RED}🚨 $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Get package info
PACKAGE_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "")
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "")

if [ -z "$PACKAGE_NAME" ] || [ -z "$CURRENT_VERSION" ]; then
    log_error "Failed to read package.json information"
    exit 1
fi

log_emergency "GuideMeFast Emergency Rollback Script"
echo "=========================================="
echo "Package: $PACKAGE_NAME"
echo "Current Version: v$CURRENT_VERSION"
echo ""

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [OPTIONS] TARGET_VERSION"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -l, --list          List available versions to rollback to"
    echo "  -f, --force         Force rollback without confirmations"
    echo "  -n, --npm-only      Only rollback NPM package (skip git)"
    echo "  -g, --git-only      Only rollback git (skip NPM)"
    echo "  -d, --dry-run       Show what would be done without executing"
    echo "  --emergency         Emergency mode (faster, less checks)"
    echo ""
    echo "Examples:"
    echo "  $0 1.2.0           # Rollback to version 1.2.0"
    echo "  $0 -l              # List available versions"
    echo "  $0 -f 1.1.5        # Force rollback without prompts"
    echo "  $0 --dry-run 1.2.0 # Preview rollback actions"
    echo ""
    exit 0
fi

# Parse arguments
FORCE=false
NPM_ONLY=false
GIT_ONLY=false
DRY_RUN=false
EMERGENCY=false
LIST_VERSIONS=false
TARGET_VERSION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            # Already handled above
            exit 0
            ;;
        -l|--list)
            LIST_VERSIONS=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -n|--npm-only)
            NPM_ONLY=true
            shift
            ;;
        -g|--git-only)
            GIT_ONLY=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --emergency)
            EMERGENCY=true
            FORCE=true
            shift
            ;;
        -*)
            log_error "Unknown option: $1"
            exit 1
            ;;
        *)
            TARGET_VERSION="$1"
            shift
            ;;
    esac
done

# List available versions
if [ "$LIST_VERSIONS" = true ]; then
    log_step "Fetching available versions from NPM..."

    if npm view $PACKAGE_NAME versions --json > /dev/null 2>&1; then
        VERSIONS=$(npm view $PACKAGE_NAME versions --json | jq -r '.[]' | tail -20)
        echo ""
        log_highlight "Last 20 published versions:"
        echo "$VERSIONS" | nl -s'. v' -w3
        echo ""

        # Show git tags too
        log_step "Available git tags:"
        git tag -l --sort=-version:refname | head -20 | nl -s'. ' -w3
        echo ""

    else
        log_error "Failed to fetch versions from NPM"
        exit 1
    fi
    exit 0
fi

# Validate target version
if [ -z "$TARGET_VERSION" ]; then
    log_error "Target version is required"
    echo "Use -l to list available versions"
    exit 1
fi

# Normalize version format (remove 'v' prefix if present)
TARGET_VERSION=$(echo "$TARGET_VERSION" | sed 's/^v//')
TARGET_TAG="v$TARGET_VERSION"

log_highlight "Rollback Details:"
echo "From: v$CURRENT_VERSION"
echo "To: v$TARGET_VERSION"
echo "NPM Only: $NPM_ONLY"
echo "Git Only: $GIT_ONLY"
echo "Force: $FORCE"
echo "Dry Run: $DRY_RUN"
echo ""

# Pre-flight checks (skip in emergency mode)
if [ "$EMERGENCY" = false ]; then
    log_step "Running pre-flight checks..."

    # Check if target version exists on NPM
    if [ "$GIT_ONLY" = false ]; then
        if npm view $PACKAGE_NAME@$TARGET_VERSION version > /dev/null 2>&1; then
            log_success "Target version v$TARGET_VERSION exists on NPM"
        else
            log_error "Version v$TARGET_VERSION does not exist on NPM"
            log_info "Available versions:"
            npm view $PACKAGE_NAME versions --json | jq -r '.[]' | tail -10
            exit 1
        fi
    fi

    # Check if target git tag exists
    if [ "$NPM_ONLY" = false ]; then
        if git rev-parse --verify "refs/tags/$TARGET_TAG" >/dev/null 2>&1; then
            log_success "Git tag $TARGET_TAG exists"
        else
            log_error "Git tag $TARGET_TAG does not exist"
            log_info "Available tags:"
            git tag -l --sort=-version:refname | head -10
            exit 1
        fi
    fi

    # Check for uncommitted changes (unless force or emergency)
    if [ "$FORCE" = false ] && [ "$NPM_ONLY" = false ]; then
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            log_warning "You have uncommitted changes:"
            git status --short
            read -p "Continue anyway? (y/N): " -n 1 -