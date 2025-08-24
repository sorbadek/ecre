#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Notifications Canister to IC Mainnet${NC}"

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}❌ dfx is not installed. Please install dfx first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "main.mo" ]; then
    echo -e "${RED}❌ main.mo not found. Please run this script from the notifications canister directory.${NC}"
    exit 1
fi

# Start dfx if not running
echo -e "${YELLOW}📡 Starting dfx...${NC}"
dfx start --background --clean

# Deploy to IC mainnet with cycles
echo -e "${YELLOW}🔧 Deploying notifications canister to IC mainnet...${NC}"
dfx deploy --network ic --with-cycles 1000000000000

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Notifications canister deployed successfully!${NC}"
    
    # Get canister ID
    CANISTER_ID=$(dfx canister --network ic id notifications)
    echo -e "${GREEN}📋 Canister ID: ${CANISTER_ID}${NC}"
    echo -e "${YELLOW}💡 Add this to your .env file:${NC}"
    echo -e "${YELLOW}NEXT_PUBLIC_NOTIFICATIONS_CANISTER_ID=${CANISTER_ID}${NC}"
    
    # Test the canister
    echo -e "${YELLOW}🧪 Testing canister...${NC}"
    dfx canister --network ic call notifications getUnreadCount
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Stop dfx
dfx stop
