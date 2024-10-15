import { useState, useEffect } from "react";

export function MonthlyVisits() {
  const [monthlyVisits, setMonthlyVisits] = useState<number | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    async function fetchMonthlyVisits() {
      try {
        const response = await fetch(
          `/api/analytics/user-monthly-visits?year=${year}&month=${month}`,
        );
        if (response.ok) {
          const data = await response.json();
          setMonthlyVisits(data.totalVisits);
        } else {
          console.error("Failed to fetch monthly visits");
        }
      } catch (error) {
        console.error("Error fetching monthly visits:", error);
      }
    }

    fetchMonthlyVisits();
  }, [year, month]);

  return (
    <div>
      <h2>Monthly Visits</h2>
      <p>
        Year: {year}, Month: {month}
      </p>
      {monthlyVisits !== null ? <p>{monthlyVisits}</p> : <p>Loading...</p>}
    </div>
  );
}
