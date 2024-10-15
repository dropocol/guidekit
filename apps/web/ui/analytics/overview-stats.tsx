"use client";

import { useEffect, useState } from "react";
import { Card, Metric, Text, AreaChart, BadgeDelta, Flex } from "@tremor/react";

export default function OverviewStats() {
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    async function fetchTotalVisitors() {
      const response = await fetch("/api/analytics/total-visitors");
      const data = await response.json();
      setTotalVisitors(data.totalVisitors);
    }
    fetchTotalVisitors();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="dark:!bg-stone-900">
        <Text>Total Visitors</Text>
        <Flex
          className="space-x-3 truncate"
          justifyContent="start"
          alignItems="baseline"
        >
          <Metric className="font-cal">{totalVisitors | 0}</Metric>
          {/* ... rest of the component */}
        </Flex>
        {/* ... AreaChart component */}
      </Card>
    </div>
  );
}
