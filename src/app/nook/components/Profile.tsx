/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { User, Connection } from "../utils/types";

interface ProfileProps {
  selectedNode?: User;
  connectionCount?: number;
  directConnections?: Connection[];
  onSelectConnection?: (nodeId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  selectedNode,
  connectionCount = 0,
  directConnections = [],
  onSelectConnection,
}) => {
  // If no node is selected, show the default state
  if (!selectedNode) {
    return (
      <div className="h-full w-full rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
        <h3 className="mb-4 border-b border-indigo-100 pb-2 text-lg font-bold text-indigo-900">
          Profile
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <h3 className="mb-2 text-lg font-medium text-indigo-900">
            No Node Selected
          </h3>
          <p className="text-sm text-gray-500">
            Click on any node in the graph to view its details and connections.
          </p>
        </div>
      </div>
    );
  }

  // Show the profile for the selected node
  return (
    <div className="h-full w-full rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 border-b border-indigo-100 pb-2 text-lg font-bold text-indigo-900">
        Profile
      </h3>

      <div className="space-y-5">
        <div className="mb-4 flex flex-col items-center text-center">
          {selectedNode.profile?.image && (
            <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border border-indigo-100">
              <img
                src={selectedNode.profile.image}
                alt={selectedNode.name}
                width="80"
                height="80"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h2 className="text-xl font-bold text-indigo-900">
            {selectedNode.name}
          </h2>
          {selectedNode.profile?.city && (
            <p className="text-sm text-gray-600">{selectedNode.profile.city}</p>
          )}
        </div>

        {selectedNode.profile?.bio && (
          <div className="mt-2 text-sm text-gray-600">
            {selectedNode.profile.bio}
          </div>
        )}
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          {selectedNode.profile?.city && (
            <span className="flex items-center">
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {selectedNode.profile.city}
            </span>
          )}
          {selectedNode.profile?.currentAffiliation && (
            <span className="flex items-center">
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {selectedNode.profile.currentAffiliation}
            </span>
          )}
          {selectedNode.profile?.url && (
            <div className="text-xs">
              <a
                href={selectedNode.profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 transition-colors hover:text-indigo-800"
              >
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {selectedNode.profile.url.replace(/^https?:\/\/(www\.)?/i, "")}
              </a>
            </div>
          )}
        </div>

        {directConnections.length > 0 && (
          <div className="h-full">
            <h4 className="mb-2 text-sm font-semibold text-indigo-800">
              Connections ({connectionCount})
            </h4>
            <div className="overflow-y-auto">
              <ul className="space-y-2">
                {directConnections.map((connection) => (
                  <li
                    key={connection.id}
                    className="flex items-center justify-between rounded-md border border-indigo-100 p-2 text-sm hover:bg-indigo-50"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-600"></span>
                      <span className="font-medium text-indigo-900">
                        {connection.name}
                      </span>
                      {/* Weight indicator */}
                      <div className="ml-2 flex items-center">
                        <div className="mr-1 h-1.5 w-10 rounded-full bg-gray-200">
                          <div
                            className="h-1.5 rounded-full bg-indigo-600"
                            style={{
                              width: `${(connection.weight / 10) * 100}%`,
                              opacity: 0.3 + (connection.weight / 10) * 0.7,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {connection.weight}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onSelectConnection && onSelectConnection(connection.id)
                      }
                      className="rounded-full bg-indigo-100 p-1 text-indigo-700 hover:bg-indigo-200"
                      aria-label="View connection"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
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
