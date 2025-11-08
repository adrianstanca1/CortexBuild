#!/bin/bash

# Service Worker Cleanup Script for Development
echo "🧹 Cleaning up service workers and caches for development..."

# Create a simple HTML file for manual cleanup
cat > public/dev-cleanup.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development Cleanup</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        button { padding: 1rem 2rem; margin: 0.5rem; font-size: 1rem; }
        #output { margin-top: 1rem; padding: 1rem; background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Development Service Worker Cleanup</h1>
    <p>Click the button below to clean up service workers and caches:</p>
    <button type="button" onclick="cleanup()">Clean Up Service Workers</button>
    <div id="output"></div>

    <script>
        async function cleanup() {
            const output = document.getElementById('output');
            output.innerHTML = 'Starting cleanup...<br>';

            try {
                // Unregister service workers
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    output.innerHTML += `Found ${registrations.length} service worker registrations<br>`;
                    
                    for (const registration of registrations) {
                        const success = await registration.unregister();
                        output.innerHTML += `Unregistered: ${registration.scope} (${success})<br>`;
                    }
                }

                // Clear caches
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    output.innerHTML += `Found ${cacheNames.length} caches<br>`;
                    
                    for (const cacheName of cacheNames) {
                        const success = await caches.delete(cacheName);
                        output.innerHTML += `Deleted cache: ${cacheName} (${success})<br>`;
                    }
                }

                output.innerHTML += '<strong>Cleanup complete! Refresh the page to continue.</strong>';
            } catch (error) {
                output.innerHTML += `Error: ${error.message}<br>`;
            }
        }
    </script>
</body>
</html>
EOF

echo "✅ Created dev-cleanup.html for manual cleanup"
echo "📍 Visit http://localhost:5173/dev-cleanup.html to clean up service workers"
echo "🔧 Or run this script to clean up automatically"