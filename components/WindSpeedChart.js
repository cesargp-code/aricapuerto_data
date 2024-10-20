import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WindSpeedChart = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWindSpeed, setCurrentWindSpeed] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Fetching data started');
    try {
      const response = await fetch('/api/wind-speed-data');
      console.log('Fetch response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      console.log('Data received:', data);
  
      const formattedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.WSPD)
      }));
      console.log('Formatted data:', formattedData);
  
      setChartData(formattedData);
      console.log('Chart data set:', formattedData);
  
      if (formattedData.length > 0) {
        const lastDataPoint = formattedData[formattedData.length - 1];
        setCurrentWindSpeed(lastDataPoint.y);
        setLastUpdated(new Date(lastDataPoint.x).toLocaleTimeString());
        console.log('Last data point set:', lastDataPoint);
      } else {
        console.log('No data points available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    console.log('Fetching data completed');
  };

  const chartOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      height: 340,
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    stroke: {
      width: 2,
      lineCap: "round",
      curve: "smooth",
    },
    series: [{
      name: "Wind Speed",
      data: chartData
    }],
    grid: {
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: -4
      },
      strokeDashArray: 4,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        padding: 0,
      },
      tooltip: {
        enabled: false
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        padding: 4
      },
    },
    colors: ["#206bc4"],
    legend: {
      show: false,
    },
    tooltip: {
      x: {
        format: 'HH:mm'
      }
    },
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Viento</h3>
        <div className="card-actions">
          <div className="main_card_value">{currentWindSpeed.toFixed(1)} m/s</div>
          <div className="main_card_value_last_updated">updated {lastUpdated}</div>
        </div>
      </div>
      <div className="card-body">
        <div id="chart-wind-speed">
          {typeof window !== 'undefined' && (
            <ReactApexChart options={chartOptions} series={chartOptions.series} type="line" height={340} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WindSpeedChart;