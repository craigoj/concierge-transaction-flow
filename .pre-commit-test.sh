#!/bin/bash
# Pre-commit test validation script
# Ensures tests pass before allowing commits

echo "🧪 Running pre-commit test validation..."

# Run tests with timeout to prevent hanging
timeout 300 npm run test:run

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed! Commit allowed."
    exit 0
else
    echo "❌ Tests failed! Commit blocked."
    echo "Please fix failing tests before committing:"
    echo "  npm test  # Run tests interactively"
    echo "  npm run test:run  # Run tests once"
    exit 1
fi