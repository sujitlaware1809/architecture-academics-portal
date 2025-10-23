import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-blue-600">Tailwind CSS Test Page</h1>
        <p className="mt-4 text-gray-600">If you can see styles applied to this page, then Tailwind CSS is working correctly!</p>
        <div className="mt-6 flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Primary Button</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Secondary Button</button>
        </div>
      </div>
    </div>
  );
}
