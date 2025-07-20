#!/bin/bash

# Angular Job - Blog Application Setup Script
# This script installs dependencies for the Angular + Node.js blog application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION found (✓)"
            return 0
        else
            print_error "Node.js version $NODE_VERSION found, but version 18+ is required"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm version $NPM_VERSION found (✓)"
        return 0
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Function to check Angular CLI
check_angular_cli() {
    if command_exists ng; then
        ANGULAR_VERSION=$(ng version --json | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
        print_success "Angular CLI version $ANGULAR_VERSION found (✓)"
        return 0
    else
        print_warning "Angular CLI not found globally, will install locally"
        return 1
    fi
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    cd ..
    print_success "Backend dependencies installed"
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    cd ..
    print_success "Frontend dependencies installed"
}

# Function to display installation completion
show_completion() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 Installation Completed Successfully! 🎉${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Configure your environment variables (see README.md)"
    echo "2. Start the backend server: cd backend && npm run dev"
    echo "3. Start the frontend server: cd frontend && npm start"
    echo "4. Open http://localhost:4200 in your browser"
    echo ""
    echo -e "${BLUE}Available Scripts:${NC}"
    echo "• Backend: npm run dev (development), npm start (production)"
    echo "• Frontend: npm start (development), npm run build (production)"
    echo ""
    echo -e "${YELLOW}Note:${NC} Please refer to README.md for detailed setup instructions"
    echo ""
}

# Main installation function
main() {
    echo ""
    echo "=========================================="
    echo -e "${BLUE}🚀 Angular Job - Blog Application Installation${NC}"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_node_version; then
        print_error "Please install Node.js 18+ and try again"
        exit 1
    fi
    
    if ! check_npm_version; then
        print_error "Please install npm and try again"
        exit 1
    fi
    
    check_angular_cli
    
    echo ""
    
    # Install dependencies
    install_backend_deps
    install_frontend_deps
    
    # Show completion message
    show_completion
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 