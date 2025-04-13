/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import type { User, Connection } from "../utils/types";
import { Flower } from "src/components/ShapesGrid";
import { motion } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";

interface ProfileProps {
  selectedNode?: User;
  connectionCount?: number;
  directConnections?: Connection[];
  onSelectConnection?: (nodeId: string) => void;
  currentUserId?: string;
  currentUser?: User;
  isOpen?: boolean;
  onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  selectedNode,
  connectionCount = 0,
  directConnections = [],
  onSelectConnection,
  currentUserId,
  currentUser,
  isOpen = false,
  onClose,
}) => {
  // Store minimized state in a ref to persist across selectedNode changes
  const minimizedStateRef = useRef(false);
  const [isMinimized, setIsMinimized] = useState(minimizedStateRef.current);
  const [dragConstraints, setDragConstraints] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const profileRef = useRef<HTMLDivElement>(null);
  const prevNodeIdRef = useRef<string | undefined>(selectedNode?.id);

  // Set up limited drag constraints
  useEffect(() => {
    // Updated constraints to allow 100px movement up and to the right
    setDragConstraints({
      top: -100, // Allow dragging 100px upward
      right: 100, // Allow dragging 100px to the right
      bottom: 0, // Prevent dragging down
      left: 0, // Prevent dragging left
    });
  }, []);

  // Preserve minimized state when selectedNode changes
  useEffect(() => {
    // Check if the node changed
    if (selectedNode?.id !== prevNodeIdRef.current) {
      // Update the previous node ID reference
      prevNodeIdRef.current = selectedNode?.id;

      // Use the existing minimized state from the ref
      setIsMinimized(minimizedStateRef.current);
    }
  }, [selectedNode]);

  // Function to toggle minimized state
  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized;
    // Update both the state and the ref
    setIsMinimized(newMinimizedState);
    minimizedStateRef.current = newMinimizedState;
  };

  // Animation variants
  const hoverAnimation = {
    scale: 1.05,
    transition: { duration: 0.2 },
  };

  const tapAnimation = {
    scale: 0.95,
    transition: { duration: 0.1 },
  };

  // Function to select current user's node
  const viewCurrentUser = () => {
    console.log("Selecting current user with ID:", currentUserId);
    if (currentUserId && onSelectConnection) {
      onSelectConnection(currentUserId);
    }
  };

  // Sort connections by weight in descending order
  const sortedConnections = [...directConnections].sort(
    (a, b) => b.weight - a.weight
  );

  // Dialog animation variants
  const dialogVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  // If no node is selected or dialog is closed, return null
  if (!selectedNode || !isOpen) return null;

  // Check if this is a different user than the current user
  const isCurrentUser = selectedNode.id === currentUserId;
  const showOverlappingImages =
    !isCurrentUser &&
    currentUser?.profile?.image &&
    selectedNode.profile?.image;

  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        ref={profileRef}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 30,
          },
        }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="pointer-events-auto absolute bottom-8 left-8 z-[1002] max-h-[600px] w-[400px] rounded-lg shadow-xl"
        style={{
          background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
          border: "1px solid #bbb",
          boxShadow:
            "3px 3px 0 rgba(0, 0, 0, 0.2), inset 1px 1px 0 rgba(255, 255, 255, 0.8)",
          overflow: isMinimized ? "hidden" : "auto",
        }}
      >
        {/* 90s Style Title Bar */}
        <div
          className="flex cursor-move items-center justify-between p-3 font-bold"
          style={{
            background:
              "linear-gradient(90deg, var(--secondary) 0%, var(--secondary-muted) 100%)",
            color: "white",
            borderBottom: isMinimized ? "none" : "2px solid #999",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.3) inset",
          }}
        >
          <div className="text-lg tracking-tight">
            {isCurrentUser ? "Your Profile" : selectedNode.name}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMinimize}
              className="rounded-sm p-1 text-white transition-colors hover:bg-white hover:bg-opacity-20"
              style={{
                boxShadow: "1px 1px 1px rgba(0, 0, 0, 0.2)",
              }}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={20} /> : <Minus size={20} />}
            </button>
            <button
              onClick={onClose}
              className="rounded-sm p-1 text-white transition-colors hover:bg-white hover:bg-opacity-20"
              style={{
                boxShadow: "1px 1px 1px rgba(0, 0, 0, 0.2)",
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile Content - Only show when not minimized */}
        {!isMinimized && (
          <div className="bg-white p-5">
            {/* Center-aligned profile section */}
            <div className="mb-4 flex flex-col items-center text-center">
              {/* Profile Images Container */}
              <div className="relative mb-4 flex h-24 items-center justify-center">
                {/* Main Profile Image - Single centered image */}
                <motion.div
                  className="h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2"
                  style={{
                    borderColor: "var(--secondary)",
                    boxShadow: "2px 2px 0 rgba(0, 0, 0, 0.1)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 },
                  }}
                >
                  {selectedNode.profile?.image ? (
                    <img
                      src={selectedNode.profile.image}
                      alt={selectedNode.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                      ?
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Name and Quick Stats - Below profile image */}
              <div className="w-full text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedNode.name}
                </h2>
                {selectedNode.profile?.currentAffiliation && (
                  <div className="mt-1 text-gray-500">
                    {selectedNode.profile.currentAffiliation}
                  </div>
                )}
                <div className="mt-1 text-sm text-gray-500">
                  {connectionCount} connections
                </div>
              </div>
            </div>

            {/* Profile Bio */}
            {selectedNode.profile?.bio && (
              <div
                className="rounded mt-4 border bg-gray-50 p-3 text-sm text-gray-700"
                style={{
                  borderColor: "#ccc",
                  boxShadow: "inset 1px 1px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                {selectedNode.profile.bio}
              </div>
            )}

            {/* Tags/Keywords */}
            {selectedNode.profile?.keywords &&
              selectedNode.profile.keywords.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-gray-700">
                    Interests & Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.profile.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="bg-secondary-light rounded-sm px-2 py-1 text-xs text-secondary"
                        style={{
                          boxShadow: "1px 1px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Profile Details */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedNode.profile?.city && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Location:</span>{" "}
                  {selectedNode.profile.city}
                </div>
              )}
              {selectedNode.profile?.url && (
                <div className="truncate text-sm">
                  <span className="font-medium text-gray-700">Website:</span>{" "}
                  <a
                    href={selectedNode.profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    {selectedNode.profile.url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>

            {/* Connections Section */}
            <div className="mt-6">
              <div
                className="mb-3 border-b pb-2 text-base font-bold"
                style={{
                  borderColor: "#ddd",
                  color: "var(--secondary)",
                }}
              >
                Connections ({connectionCount})
              </div>
              {connectionCount > 0 ? (
                <div
                  className="max-h-64 divide-y overflow-auto pr-2"
                  style={{ borderColor: "#eee" }}
                >
                  {directConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="rounded flex cursor-pointer items-center justify-between px-2 py-2 transition-colors hover:bg-gray-50"
                      onClick={() => onSelectConnection?.(connection.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {connection.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {connection.type === "user"
                            ? "Member"
                            : connection.type}
                        </div>
                      </div>
                      <div
                        className="rounded px-2 py-1 text-xs"
                        style={{
                          background:
                            connection.weight > 7
                              ? "var(--highlight-active)"
                              : connection.weight > 5
                              ? "var(--highlight)"
                              : "var(--accent)",
                          color:
                            connection.weight > 5
                              ? "white"
                              : "var(--accent-foreground)",
                          boxShadow: "1px 1px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {connection.weight > 7
                          ? "Very Close"
                          : connection.weight > 5
                          ? "Close"
                          : "Connected"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm italic text-gray-500">
                  No connections found for this profile.
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;

// UserAvatar component to show current user's profile picture
export const UserAvatar: React.FC<{
  currentUser?: User;
  currentUserId?: string;
  onSelectUser: (userId: string) => void;
  size?: number;
}> = ({ currentUser, currentUserId, onSelectUser, size = 36 }) => {
  if (!currentUser || !currentUserId) return null;

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-full border-2"
      style={{
        height: size,
        width: size,
        borderColor: "var(--info)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
      }}
      whileHover={{
        scale: 1.1,
        borderColor: "var(--info-foreground)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        onSelectUser(currentUserId);
      }}
      title="View your profile"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.3 },
      }}
    >
      {currentUser.profile?.image ? (
        <motion.img
          src={currentUser.profile.image}
          alt="Your profile"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      ) : (
        <motion.div
          className="flex h-full w-full items-center justify-center bg-info text-sm text-white"
          whileHover={{
            backgroundColor: "var(--info-foreground)",
            transition: { duration: 0.2 },
          }}
        >
          {currentUser.name.charAt(0).toUpperCase()}
        </motion.div>
      )}
    </motion.div>
  );
};
