"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface DailyVisit {
  date: string;
  visits: number;
}

const DailyVisitsChart: React.FC = () => {
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);

  useEffect(() => {
    const fetchDailyVisits = async () => {
      const response = await fetch("/api/analytics/daily-visits");
      if (response.ok) {
        const data = await response.json();
        setDailyVisits(data);
      }
    };

    fetchDailyVisits();
  }, []);

  const chartColor = {
    // primary: "rgb(53, 162, 235, 0.5)",
    // background: "rgba(53, 162, 235, 0.5)",
    primary: "rgba(0, 0, 0, 0.9)",
    background: "rgba(0, 0, 0, 0.8)",
  };

  const chartData = {
    labels: dailyVisits.map((entry) => entry.date),
    datasets: [
      {
        label: "Daily Visits",
        data: dailyVisits.map((entry) => entry.visits),
        borderColor: chartColor.primary,
        backgroundColor: chartColor.background,
        borderWidth: 2,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,

    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: "Daily Knowledgebase Visits (Last 15 Days)",
        color: "#333",
        font: {
          size: 12,
          weight: "normal",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 5,
        padding: 10,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "d MMM",
          },
        },
        grid: {
          display: false,
          color: "rgba(0, 0, 0, 0.1)", // Color of the grid lines
        },
        border: {
          color: "rgba(0, 0, 0, 0.1)", // Color of the x-axis line
          width: 0, // Width of the x-axis line
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max:
          Math.ceil(
            Math.max(...dailyVisits.map((entry) => entry.visits)) / 20,
          ) *
            20 +
          20,
        ticks: {
          stepSize: 20,
          precision: 0,
          callback: function (value) {
            let number = value as number;
            // Format the value to show in 'k' format
            return number >= 1000 ? (number / 1000).toFixed(1) + "k" : value;
          },
          font: {
            size: 12,
          },
          maxTicksLimit: 8,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.03)",
        },
        border: {
          color: "rgba(0, 0, 0, 0.1)", // Color of the x-axis line
          width: 0, // Width of the x-axis line
        },
      },
    },
  };

  return (
    <div className="flex h-48 flex-col rounded-xl">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default DailyVisitsChart;
