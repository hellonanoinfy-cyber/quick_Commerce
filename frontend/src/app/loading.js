import React from 'react';

export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 p-8">
        <div className="flex justify-center">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
        <p className="text-gray-500">Please wait while we fetch the data</p>
      </div>
    </main>
  );
}
