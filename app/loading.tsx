import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
    </div>
  );
}


