import React from "react";

const GraphLegend: React.FC = () => {
  return (
    <div className="mt-4 text-sm text-gray-600">
      <p>• Larger circles = More activity (Events Created + RSVPs)</p>
      <p>• Different colors = Automatically detected communities</p>
      <p>
        • Proximity = Connection strength (closer nodes = stronger connection)
      </p>
      <p>• Hover over a node to see the user&apos;s name</p>
      <p>• When a user is selected, their name is always visible</p>
      <p>• Click on a user to view their profile</p>
      <p>• Use the search bar to find and select specific users</p>
    </div>
  );
};

export default GraphLegend;
