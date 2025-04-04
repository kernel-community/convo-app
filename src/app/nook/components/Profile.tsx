import React from "react";
import type { User } from "../utils/types";

interface ProfileProps {
  selectedUser: User;
  connectionCount: number;
  directConnections: Array<{ id: string; name: string; strength: number }>;
  onSelectConnection: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  selectedUser,
  connectionCount,
  directConnections,
  onSelectConnection,
}) => {
  return (
    <div className="rounded border bg-gray-50 p-4 md:w-72">
      <h3 className="mb-3 border-b pb-2 text-lg font-bold">Profile</h3>

      <div className="space-y-4">
        <div className="rounded bg-indigo-100 p-3">
          <p className="text-xl font-bold text-indigo-800">
            {selectedUser.name}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Activity Metrics</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <div className="rounded bg-indigo-50 p-3">
              <p className="text-xs text-gray-500">Events Created</p>
              <p className="text-xl font-bold text-indigo-600">
                {selectedUser.eventsCreated}
              </p>
            </div>
            <div className="rounded bg-indigo-50 p-3">
              <p className="text-xs text-gray-500">RSVPs</p>
              <p className="text-xl font-bold text-indigo-600">
                {selectedUser.rsvps}
              </p>
            </div>
            <div className="rounded bg-indigo-50 p-3">
              <p className="text-xs text-gray-500">Direct Connections</p>
              <p className="text-xl font-bold text-indigo-600">
                {connectionCount}
              </p>
            </div>
          </div>
        </div>

        {directConnections.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500">Connections</p>
            <div className="rounded mt-2 overflow-hidden border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-200">
                {directConnections.map((connection) => (
                  <li key={connection.id} className="p-2 hover:bg-indigo-50">
                    <button
                      className="flex w-full items-center justify-between text-left text-sm"
                      onClick={() => onSelectConnection(connection.id)}
                    >
                      <span className="font-medium text-indigo-600 underline">
                        {connection.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Strength: {connection.strength}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
