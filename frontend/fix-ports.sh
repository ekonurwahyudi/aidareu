#!/bin/bash

# Script to fix all hardcoded ports in frontend files
# Changes:
# - localhost:8000 -> localhost:8888 (Backend API)
# - localhost:8080 -> localhost:3002 (Frontend)

echo "================================"
echo "Fixing Port Numbers in Frontend"
echo "================================"
echo ""

# Count occurrences before
echo "📊 Current occurrences:"
echo "  localhost:8000: $(grep -r "localhost:8000" src/ | wc -l)"
echo "  localhost:8080: $(grep -r "localhost:8080" src/ | wc -l)"
echo ""

# Backup confirmation
read -p "Create backup before replacing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📦 Creating backup..."
    tar -czf "src-backup-$(date +%Y%m%d-%H%M%S).tar.gz" src/
    echo "✅ Backup created"
    echo ""
fi

# Replace localhost:8000 with localhost:8888
echo "🔄 Replacing localhost:8000 -> localhost:8888..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -exec sed -i 's/localhost:8000/localhost:8888/g' {} \;
echo "✅ Done"

# Replace 127.0.0.1:8000 with 127.0.0.1:8888
echo "🔄 Replacing 127.0.0.1:8000 -> 127.0.0.1:8888..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -exec sed -i 's/127\.0\.0\.1:8000/127.0.0.1:8888/g' {} \;
echo "✅ Done"

# Replace localhost:8080 with localhost:3002
echo "🔄 Replacing localhost:8080 -> localhost:3002..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -exec sed -i 's/localhost:8080/localhost:3002/g' {} \;
echo "✅ Done"

# Replace 127.0.0.1:8080 with 127.0.0.1:3002
echo "🔄 Replacing 127.0.0.1:8080 -> 127.0.0.1:3002..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -exec sed -i 's/127\.0\.0\.1:8080/127.0.0.1:3002/g' {} \;
echo "✅ Done"

echo ""
echo "📊 After replacement:"
echo "  localhost:8888: $(grep -r "localhost:8888" src/ | wc -l)"
echo "  localhost:3002: $(grep -r "localhost:3002" src/ | wc -l)"
echo "  localhost:8000: $(grep -r "localhost:8000" src/ | wc -l) (should be 0)"
echo "  localhost:8080: $(grep -r "localhost:8080" src/ | wc -l) (should be minimal)"
echo ""
echo "✨ Port fix completed!"
echo ""
echo "⚠️  Note: Review changes before committing:"
echo "   git diff src/"
