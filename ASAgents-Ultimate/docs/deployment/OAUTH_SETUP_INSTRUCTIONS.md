🔧 GOOGLE OAUTH SETUP - COMPLETE INSTRUCTIONS
================================================

Your current OAuth error (Error 400) is caused by missing redirect URIs in Google Cloud Console.

📋 STEP 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: 747468230889-nmpf6edq6r3j78oc9abkceojssb9iue4.apps.googleusercontent.com
3. Click the EDIT button (pencil icon)

📋 STEP 2: Add ALL these redirect URIs
Copy and paste EVERY URL below into "Authorized redirect URIs":

✅ Current deployment:
https://final-ed4ar0b5u-adrian-b7e84541.vercel.app/auth/google/callback

✅ Previous deployments (add all to prevent future issues):
https://final-jn9zr3544-adrian-b7e84541.vercel.app/auth/google/callback
https://final-1j1ze0sc0-adrian-b7e84541.vercel.app/auth/google/callback
https://final-9i9634arf-adrian-b7e84541.vercel.app/auth/google/callback
https://final-hd6tbubcs-adrian-b7e84541.vercel.app/auth/google/callback
https://final-a8xofrom7-adrian-b7e84541.vercel.app/auth/google/callback

✅ Development URLs:
http://localhost:5173/auth/google/callback
http://localhost:3000/auth/google/callback
http://localhost:4000/auth/google/callback

📋 STEP 3: Save and wait
1. Click "SAVE" in Google Cloud Console
2. Wait 5-10 minutes for changes to propagate
3. Test OAuth at: https://final-ed4ar0b5u-adrian-b7e84541.vercel.app

🔍 TROUBLESHOOTING
- If you still get Error 400: Double-check that ALL URLs above are added
- Make sure there are no typos in the URLs
- Ensure you clicked "SAVE" in Google Cloud Console
- Wait the full 10 minutes for Google to update

⚡ QUICK COPY-PASTE
Copy everything between the lines and paste into Google Cloud Console:

--- START COPY HERE ---
https://final-ed4ar0b5u-adrian-b7e84541.vercel.app/auth/google/callback
https://final-jn9zr3544-adrian-b7e84541.vercel.app/auth/google/callback
https://final-1j1ze0sc0-adrian-b7e84541.vercel.app/auth/google/callback
https://final-9i9634arf-adrian-b7e84541.vercel.app/auth/google/callback
https://final-hd6tbubcs-adrian-b7e84541.vercel.app/auth/google/callback
https://final-a8xofrom7-adrian-b7e84541.vercel.app/auth/google/callback
http://localhost:5173/auth/google/callback
http://localhost:3000/auth/google/callback
http://localhost:4000/auth/google/callback
--- END COPY HERE ---

After completing these steps, your OAuth should work! 🚀