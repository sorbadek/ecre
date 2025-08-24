#!/bin/bash

echo "🚀 Deploying Sessions canister to Internet Computer..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install it first:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Start dfx if not running (for local development)
if [ "$1" = "local" ]; then
    echo "🔧 Starting local replica..."
    dfx start --background --clean
    
    echo "📦 Deploying to local replica..."
    dfx deploy sessions --network local
    
    echo "✅ Local deployment complete!"
    echo "📋 Canister ID: $(dfx canister id sessions --network local)"
else
    # Deploy to IC mainnet
    echo "🌐 Deploying to IC mainnet..."
    
    # Create canister with cycles (you need to have cycles)
    dfx deploy sessions --network ic --with-cycles 1000000000000
    
    echo "✅ Mainnet deployment complete!"
    echo "📋 Canister ID: $(dfx canister id sessions --network ic)"
    echo "🔗 Candid UI: https://$(dfx canister id sessions --network ic).raw.ic0.app/_/candid"
fi

echo ""
echo "🎉 Sessions canister deployed successfully!"
echo "💡 Update your frontend with the canister ID shown above"
