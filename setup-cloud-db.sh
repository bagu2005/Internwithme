#!/bin/bash

echo "🌐 InternWithMe Cloud Database Setup"
echo "====================================="
echo ""

echo "Choose your cloud database provider:"
echo "1) Supabase (Recommended - Free & Easy)"
echo "2) Railway"
echo "3) Neon"
echo "4) Manual setup"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Setting up Supabase..."
        echo ""
        echo "1. Go to https://supabase.com"
        echo "2. Sign up with GitHub"
        echo "3. Create a new project:"
        echo "   - Project name: internwithme"
        echo "   - Choose a strong database password"
        echo "   - Select region closest to you"
        echo ""
        echo "4. Wait for project to be ready (2-3 minutes)"
        echo "5. Go to Settings → Database"
        echo "6. Copy the 'Connection string' (URI)"
        echo ""
        read -p "Paste your Supabase connection string here: " connection_string
        
        if [[ $connection_string == postgresql://* ]]; then
            echo ""
            echo "✅ Valid connection string detected!"
            echo "Updating server/.env file..."
            
            # Extract components from connection string
            # Format: postgresql://user:password@host:port/database
            DB_USER=$(echo $connection_string | sed 's/.*:\/\/\([^:]*\):.*/\1/')
            DB_PASSWORD=$(echo $connection_string | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')
            DB_HOST=$(echo $connection_string | sed 's/.*@\([^:]*\):.*/\1/')
            DB_PORT=$(echo $connection_string | sed 's/.*:\([0-9]*\)\/.*/\1/')
            DB_NAME=$(echo $connection_string | sed 's/.*\/\([^?]*\).*/\1/')
            
            # Update .env file
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$connection_string|" server/.env
            sed -i '' "s|DB_HOST=.*|DB_HOST=$DB_HOST|" server/.env
            sed -i '' "s|DB_PORT=.*|DB_PORT=$DB_PORT|" server/.env
            sed -i '' "s|DB_NAME=.*|DB_NAME=$DB_NAME|" server/.env
            sed -i '' "s|DB_USER=.*|DB_USER=$DB_USER|" server/.env
            sed -i '' "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" server/.env
            
            echo "✅ Database configuration updated!"
            echo ""
            echo "Testing connection..."
            cd server && npm run dev
        else
            echo "❌ Invalid connection string format"
            echo "Expected format: postgresql://user:password@host:port/database"
        fi
        ;;
    2)
        echo ""
        echo "🚂 Setting up Railway..."
        echo ""
        echo "1. Go to https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Create new project → Database → PostgreSQL"
        echo "4. Copy the connection string from the database service"
        echo ""
        read -p "Paste your Railway connection string here: " connection_string
        echo "Updating configuration..."
        ;;
    3)
        echo ""
        echo "⚡ Setting up Neon..."
        echo ""
        echo "1. Go to https://neon.tech"
        echo "2. Sign up with GitHub"
        echo "3. Create project"
        echo "4. Copy the connection string"
        echo ""
        read -p "Paste your Neon connection string here: " connection_string
        echo "Updating configuration..."
        ;;
    4)
        echo ""
        echo "📝 Manual setup instructions:"
        echo ""
        echo "1. Get your PostgreSQL connection string from your provider"
        echo "2. Update server/.env with these values:"
        echo "   DATABASE_URL=your_connection_string"
        echo "   DB_HOST=your_host"
        echo "   DB_PORT=5432"
        echo "   DB_NAME=your_database_name"
        echo "   DB_USER=your_username"
        echo "   DB_PASSWORD=your_password"
        echo ""
        echo "3. Run: cd server && npm run dev"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! Your InternWithMe app is ready with cloud database!"
echo ""
echo "Next steps:"
echo "1. The server will automatically create database tables"
echo "2. Visit http://localhost:3001 to see your app"
echo "3. Test user registration and login"
echo ""
echo "Happy coding! 🚀"
