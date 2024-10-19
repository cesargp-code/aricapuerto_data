import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; // Dynamically import ApexCharts to avoid "document is not defined" error

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Dashboard = () => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        const response = await fetch(
          'https://cors-anywhere.herokuapp.com/https://oceancom.msm-data.com/api/device/10/EMA/Temperature/'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch temperature data');
        }

        const jsonData = await response.json();
        console.log(jsonData); // For debugging, to make sure data is coming in

        // Navigate through the data structure to get the "values" array
        const values = jsonData.data.EMA['0'].Temperature.DEWT.values;

        // Extract temperature and date for the chart
        const temperatures = Object.values(values).map((item) =>
          parseFloat(item.value)
        ); // Convert to float
        const timestamps = Object.values(values).map((item) => item.date); // Get dates

        setTemperatureData(temperatures);
        setCategories(timestamps);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchTemperatureData();
  }, []);

  const chartOptions = {
    chart: {
      id: 'temperature-chart',
    },
    xaxis: {
      categories: categories, // Time or date on the x-axis
    },
    title: {
      text: 'Temperature Over Time',
      align: 'center',
    },
  };

  const chartSeries = [
    {
      name: 'Temperature (°C)',
      data: temperatureData, // Temperature data on the y-axis
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meteorological Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Temperature</h5>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={350}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
