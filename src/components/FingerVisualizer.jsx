// components/FingerVisualizer.jsx

import React from 'react';

const FingerVisualizer = ({ fingers }) => {
  const fingersUp = Object.values(fingers).filter(Boolean).length;

  let chordName = "";
  if (fingersUp === 1) chordName = "D Major";
  else if (fingersUp === 2) chordName = "B Minor";
  else if (fingersUp === 3) chordName = "G Major";
  else if (fingersUp === 4) chordName = "A Major";
  else if (fingersUp === 5) chordName = "Full Hand!";

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">🎶 Finger Status</h2>
      <div className="flex justify-center gap-4 flex-wrap">
        {Object.entries(fingers).map(([finger, isUp]) => (
          <div
            key={finger}
            className={`px-4 py-2 rounded-md shadow-md ${
              isUp ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {finger.charAt(0).toUpperCase() + finger.slice(1)}
          </div>
        ))}
      </div>

      <div className="mt-6 text-lg font-bold">
        {fingersUp > 0 ? `Chording: ${chordName}` : 'No Fingers Detected'}
      </div>
    </div>
  );
};

export default FingerVisualizer;
