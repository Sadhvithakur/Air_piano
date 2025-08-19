import React from "react";
import classNames from "classnames";

const fingerLabels = ["thumb", "index", "middle", "ring", "pinky"];

const ChordVisualizer = ({ active }) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {fingerLabels.map((finger) => (
        <div
          key={finger}
          className={classNames(
            "w-16 p-2 rounded text-white text-sm",
            active[finger] ? "bg-green-500" : "bg-gray-700"
          )}
        >
          {finger.toUpperCase()}
        </div>
      ))}
    </div>
  );
};

export default ChordVisualizer;
