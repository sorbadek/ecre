#!/bin/bash

echo "🚀 Deploying Learning Analytics Canister to IC Mainnet..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfx first."
    exit 1
fi

# Check if user is logged in
if ! dfx identity whoami &> /dev/null; then
    echo "❌ Please login to dfx first: dfx identity use default"
    exit 1
fi

# Deploy to IC mainnet
echo "📦 Building and deploying canister..."
dfx deploy --network ic --with-cycles 1000000000000

if [ $? -eq 0 ]; then
    echo "✅ Learning Analytics Canister deployed successfully!"
    echo "📋 Getting canister information..."
    dfx canister --network ic id learning_analytics
    echo "💡 Update the LEARNING_ANALYTICS_CANISTER_ID in your frontend code with the canister ID above."
else
    echo "❌ Deployment failed!"
    exit 1
fi
