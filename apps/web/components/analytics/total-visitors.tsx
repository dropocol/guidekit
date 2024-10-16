"use client";

import React, { useEffect, useState } from "react";

const TotalVisitors: React.FC = () => {
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    async function fetchTotalVisitors() {
      try {
        const response = await fetch("/api/analytics/total-visitors"); // Replace with your actual API endpoint
        const data = await response.json();
        setTotalVisitors(data.totalVisitors); // Assuming the API returns an object with a 'total' property
      } catch (error) {
        console.error("Error fetching total visitors:", error);
      }
    }

    fetchTotalVisitors();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-4xl font-bold">{totalVisitors}</p>
      <p className="text-sm font-medium text-stone-500">Visitors</p>
    </div>
  );
};

export default TotalVisitors;
