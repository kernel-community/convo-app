"use client";
// pages/map.tsx
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import type { Marker } from "../map/MapView";
import MapView from "../map/MapView";
import { locations as mockData } from "../utils/mock";
import type { LocationData } from "../utils/mock";

const MapPage: NextPage = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);

  // Load mock data (simulating API call)
  useEffect(() => {
    // Simulate API latency
    const timer = setTimeout(() => {
      setLocations(mockData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Convert location data to markers
  useEffect(() => {
    const formattedMarkers = locations.map((location) => ({
      id: location.id,
      longitude: location.longitude,
      latitude: location.latitude,
      title: location.name,
      color: getRandomColor(location.id), // Assign different colors based on ID
    }));

    setMarkers(formattedMarkers);
  }, [locations]);

  // Generate a color based on ID (for variety)
  const getRandomColor = (id: number) => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F033FF",
      "#FF33F0",
      "#33FFF0",
      "#F0FF33",
      "#8333FF",
      "#FF8333",
      "#33FF83",
    ];

    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Location Map</title>
        <meta name="description" content="View locations on a map" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Global Community Locations</h1>

        <div className="rounded-lg bg-white p-4 shadow-md">
          {loading ? (
            <div className="flex h-[600px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <MapView
              markers={markers}
              showUserLocation={true}
              className="h-[600px]"
            />
          )}
        </div>

        {/* Location list below the map */}
        {!loading && (
          <div className="mt-8 rounded-lg bg-white p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">All Locations</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="rounded border border-gray-200 p-4 hover:bg-gray-50"
                  style={{
                    borderLeft: `4px solid ${getRandomColor(location.id)}`,
                  }}
                >
                  <h3 className="font-medium">{location.name}</h3>
                  {location.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {location.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {location.latitude.toFixed(4)},{" "}
                    {location.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MapPage;
