import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IconArrowRight } from '@tabler/icons-react';
import WindDirectionStrip from './WindDirectionStrip';
import { DiagnosticCategory } from 'typescript';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WindSpeedChart = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWindSpeed, setCurrentWindSpeed] = useState('-');
  const [windDirChartData, setWindDirChartData] = useState([]);
  const [currentWindDir, setCurrentWindDir] = useState('-');
  const [isStaleData, setIsStaleData] = useState(false);

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
  
      // Format data for wind speed chart with direction included
      const formattedWindSpeedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.WSPD),
        direction: parseFloat(item.WDIR) // Store direction with each point
      }));
      console.log('Formatted wind speed data:', formattedWindSpeedData);
  
      // Format data for wind direction chart
      const formattedWindDirData = data.map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.WDIR)
      }));
      console.log('Formatted wind direction data:', formattedWindDirData);
  
      setChartData(formattedWindSpeedData);
      setWindDirChartData(formattedWindDirData);
      console.log('Chart data set:', formattedWindSpeedData);
  
      if (formattedWindSpeedData.length > 0) {
        const lastDataPoint = formattedWindSpeedData[formattedWindSpeedData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentWindSpeed(lastDataPoint.y.toFixed(1));
        setCurrentWindDir(Math.round(lastDataPoint.direction));
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        console.log('Updated values:', {
          speed: lastDataPoint.y.toFixed(1),
          direction: Math.round(lastDataPoint.direction),
          time: lastDataTime
        });
      } else {
        console.log('No data points available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    console.log('Fetching data completed');
  };

  const chartOptionsSpeed = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      height: 200,
      parentHeightOffset: 0,
      zoom: false,
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
      type: 'numeric',
      tickAmount: 9,
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false
      },
    },
    yaxis: {
      labels: {
        padding: 4,
      },
      min: 0,
    },
    colors: ["#157B37"],
    legend: {
      show: false,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const time = new Date(data.x).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false  // This forces 24-hour format
        });
        const speed = data.y.toFixed(1);
        const direction = data.direction.toFixed(0);
        
        return `
          <div class="arrow_box">
            <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
            <div>${speed} m/s</div>
            <div>${direction}°</div>
          </div>
        `;
      }
    },
  };

  return (
    <div className="card" id="home_wind">
      <div className="card-header">
        <div>
          <h3 className="card-title">Viento (m/s)</h3>
          <p className={`card-subtitle ${isStaleData ? 'status status-red' : ''}`} 
             style={{ 
               fontSize: "x-small",
               ...(isStaleData && { 
                 height: "18px",
                 padding: "0 5px"
               })
             }}>
            {isStaleData && <span className="status-dot status-dot-animated"></span>}
            actualizado {lastUpdated}
          </p>
        </div>
        <div className="card-actions">
          <span className="status status-teal main_card_value">
            <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                  style={isStaleData ? { backgroundColor: '#909090' } : {}}>
            </span>
            {currentWindSpeed} m/s  |  {currentWindDir}°
          </span>
          <IconArrowRight
            stroke={2}
            size={24} 
            className="text-orange ms-2"
          />
        </div>
      </div>
      <div className="card-body">
        <div id="chart-wind-speed">
          {typeof window !== 'undefined' && (
            <ReactApexChart options={chartOptionsSpeed} series={chartOptionsSpeed.series} type="line" height={200} />
          )}
        </div>
        <WindDirectionStrip windDirData={windDirChartData} />
      </div>
    </div>
  );
};

export default WindSpeedChart;