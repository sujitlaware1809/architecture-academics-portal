#!/bin/bash

# Usage: ./update-ip.sh <NEW_IP_ADDRESS>
# Example: ./update-ip.sh 13.233.101.55

if [ -z "$1" ]; then
    echo "❌ Error: Please provide the new IP address."
    echo "Usage: ./update-ip.sh <NEW_IP_ADDRESS>"
    exit 1
fi

NEW_IP=$1
OLD_IP="15.206.47.135" # The IP currently hardcoded in scripts

echo "🔄 Updating IP address to $NEW_IP..."

# Update setup-port-3000.sh
sed -i "s/$OLD_IP/$NEW_IP/g" setup-port-3000.sh
sed -i "s/http:\/\/localhost:8000/http:\/\/$NEW_IP:8000/g" setup-port-3000.sh

# Update deploy-fresh-ec2.sh
sed -i "s/$OLD_IP/$NEW_IP/g" deploy-fresh-ec2.sh

# Update frontend .env.local template if it exists in the script
# (The setup-port-3000.sh script generates the .env.local, so updating that script is sufficient for the server)

# Update local frontend .env.local for reference (if running locally to build)
if [ -f "frontend/.env.local" ]; then
    sed -i "s/localhost:8000/$NEW_IP:8000/g" frontend/.env.local
    sed -i "s/127.0.0.1:8000/$NEW_IP:8000/g" frontend/.env.local
    echo "✅ Updated frontend/.env.local"
fi

echo "✅ IP address updated in deployment scripts."
echo "🚀 You can now run the deployment scripts on your EC2 instance."
