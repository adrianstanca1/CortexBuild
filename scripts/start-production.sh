#!/bin/sh
# Production startup script for CortexBuild
# Manages both API server and frontend processes with proper signal handling

# Function to handle shutdown signals
cleanup() {
    echo "Received shutdown signal, cleaning up..."
    if [ ! -z "$API_PID" ]; then
        echo "Stopping API server (PID: $API_PID)..."
        kill -TERM "$API_PID" 2>/dev/null || true
        wait "$API_PID" 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}

# Trap shutdown signals
trap cleanup SIGTERM SIGINT

# Start API server in background
echo "Starting API server..."
node api-server-simple.cjs &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Check if API server is still running
if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "ERROR: API server failed to start"
    exit 1
fi

# Start frontend server in background
echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!

# Wait for both processes, exit if either dies
wait $API_PID $FRONTEND_PID
EXIT_CODE=$?

# Cleanup on exit
cleanup

exit $EXIT_CODE

