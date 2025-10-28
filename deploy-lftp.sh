#!/bin/bash

# IONOS SFTP Deployment using lftp
# More reliable authentication handling

set -e

echo "🚀 Starting IONOS deployment via LFTP..."
echo "📁 Local: ./deployment"
echo "🌐 Remote: access-5018479682.webspace-host.com/"

# SFTP credentials
SFTP_HOST="access-5018479682.webspace-host.com"
SFTP_USER="a1064628"
SFTP_PASS="Cumparavinde1"
REMOTE_PATH="/"
LOCAL_PATH="./deployment"

# Check if deployment directory exists
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Error: Deployment directory not found: $LOCAL_PATH"
    exit 1
fi

echo "🔌 Connecting to IONOS server..."
echo "📊 Server: $SFTP_HOST"
echo "👤 User: $SFTP_USER"

# Use lftp to deploy
lftp -c "
set sftp:auto-confirm yes
set ssl:verify-certificate no
open sftp://$SFTP_USER:$SFTP_PASS@$SFTP_HOST
echo '✅ Connected successfully'
echo '📋 Current remote files:'
ls $REMOTE_PATH
echo ''
echo '🧹 Cleaning old deployment files...'
rm -f $REMOTE_PATH/*.html 2>/dev/null || true
rm -f $REMOTE_PATH/*.js 2>/dev/null || true
rm -f $REMOTE_PATH/*.css 2>/dev/null || true
rm -f $REMOTE_PATH/favicon.ico 2>/dev/null || true
rm -rf $REMOTE_PATH/assets 2>/dev/null || true
echo '✅ Cleanup complete'
echo ''
echo '📤 Uploading new files...'
mirror --reverse --delete --verbose=1 $LOCAL_PATH $REMOTE_PATH
echo ''
echo '🔍 Verifying deployment...'
ls $REMOTE_PATH
echo ''
echo '✅ Deployment complete!'
echo '🌐 Your site is live at: https://asagents.co.uk'
echo '🌐 Or: https://access-5018479682.webspace-host.com'
bye
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "✅ All files uploaded to IONOS webspace"
    echo "🌐 Live URL: https://asagents.co.uk"
    echo "🔧 Management: https://my.ionos.co.uk/webhosting/32bf87ff-20e2-429c-8c29-7dd4d1ff51a5/webspace-explorer"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above"
    exit 1
fi

