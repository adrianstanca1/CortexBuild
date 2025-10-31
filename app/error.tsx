"use client";
import React from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button onClick={reset} className="bg-blue-600 text-white rounded px-4 py-2">Try again</button>
          </div>
        </div>
      </body>
    </html>
  );
}


