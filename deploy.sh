#!/bin/bash

echo "🚀 Building and deploying to Vercel..."

# Build the client
cd client
npm install
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Built files are in client/dist/"
    echo "🌐 You can now deploy this to Vercel manually"
else
    echo "❌ Build failed!"
    exit 1
fi
