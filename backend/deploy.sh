#!/bin/bash

# Peerverse Backend Deployment Script
echo "🚀 Deploying Peerverse Canisters to Internet Computer..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfx first."
    exit 1
fi

# Start dfx if not running (for local deployment)
if [ "$1" = "local" ]; then
    echo "🔧 Starting local dfx replica..."
    dfx start --background --clean
    NETWORK="local"
else
    echo "🌐 Deploying to IC mainnet..."
    NETWORK="ic"
fi

# Deploy all canisters
echo "📦 Deploying User Profile canister..."
dfx deploy user_profile --network $NETWORK --with-cycles 1000000000000

echo "📊 Deploying Learning Analytics canister..."
dfx deploy learning_analytics --network $NETWORK --with-cycles 1000000000000

echo "🔔 Deploying Notifications canister..."
dfx deploy notifications --network $NETWORK --with-cycles 1000000000000

echo "👥 Deploying Social canister..."
dfx deploy social --network $NETWORK --with-cycles 1000000000000

echo "🎯 Deploying Recommendations canister..."
dfx deploy recommendations --network $NETWORK --with-cycles 1000000000000

echo "🎓 Deploying Sessions canister..."
dfx deploy sessions --network $NETWORK --with-cycles 1000000000000

echo "🎨 Deploying Frontend assets..."
dfx deploy peerverse_frontend --network $NETWORK

# Get canister IDs
echo "📋 Getting canister IDs..."
USER_PROFILE_ID=$(dfx canister id user_profile --network $NETWORK)
LEARNING_ANALYTICS_ID=$(dfx canister id learning_analytics --network $NETWORK)
NOTIFICATIONS_ID=$(dfx canister id notifications --network $NETWORK)
SOCIAL_ID=$(dfx canister id social --network $NETWORK)
RECOMMENDATIONS_ID=$(dfx canister id recommendations --network $NETWORK)
SESSIONS_ID=$(dfx canister id sessions --network $NETWORK)
FRONTEND_ID=$(dfx canister id peerverse_frontend --network $NETWORK)

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Canister IDs:"
echo "User Profile: $USER_PROFILE_ID"
echo "Learning Analytics: $LEARNING_ANALYTICS_ID"
echo "Notifications: $NOTIFICATIONS_ID"
echo "Social: $SOCIAL_ID"
echo "Recommendations: $RECOMMENDATIONS_ID"
echo "Sessions: $SESSIONS_ID"
echo "Frontend: $FRONTEND_ID"
echo ""

if [ "$NETWORK" = "ic" ]; then
    echo "🌐 Your application is live at:"
    echo "https://$FRONTEND_ID.ic0.app"
else
    echo "🏠 Your local application is running at:"
    echo "http://localhost:4943/?canisterId=$FRONTEND_ID"
fi

echo ""
echo "💡 Next steps:"
echo "1. Update your frontend agent.ts with the new canister IDs"
echo "2. Test all canister integrations"
echo "3. Monitor canister cycles and health"
echo ""
echo "🎉 Happy learning with Peerverse!"
