#!/bin/bash

# InternWithMe Setup Script
echo "🚀 Setting up InternWithMe..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

# Server environment
if [ ! -f server/.env ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env file"
    echo "⚠️  Please update server/.env with your database credentials"
else
    echo "✅ server/.env already exists"
fi

# Client environment
if [ ! -f client/.env ]; then
    cp client/env.example client/.env
    echo "✅ Created client/.env file"
else
    echo "✅ client/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your database credentials"
echo "2. Start PostgreSQL and Redis (or use Docker)"
echo "3. Run 'npm run dev' to start the development servers"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both frontend and backend"
echo "  npm run server:dev   - Start only the backend"
echo "  npm run client:dev   - Start only the frontend"
echo "  npm run build        - Build for production"
echo ""
echo "Docker commands:"
echo "  docker-compose up    - Start with Docker"
echo "  docker-compose down  - Stop Docker services"
echo ""
echo "Happy coding! 🎓"
