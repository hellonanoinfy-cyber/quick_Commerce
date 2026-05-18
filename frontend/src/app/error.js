'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-6xl font-bold text-error">!</h1>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
