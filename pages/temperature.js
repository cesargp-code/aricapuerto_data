import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TemperaturePage = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentTemp, setCurrentTemp] = useState('-');
  const [isStaleData, setIsStaleData] = useState(false);
  const [stats, setStats] = useState({
    min: '-',
    max: '-',
    avg: '-'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/temperature-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      // Format data for the chart
      const formattedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.DRYT)
      }));

      setChartData(formattedData);

      if (formattedData.length > 0) {
        const lastDataPoint = formattedData[formattedData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentTemp(lastDataPoint.y.toFixed(1));
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        // Calculate statistics
        const temperatures = formattedData.map(point => point.y);
        setStats({
          min: Math.min(...temperatures).toFixed(1),
          max: Math.max(...temperatures).toFixed(1),
          avg: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    }
  };

  const chartOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      height: 400,
      parentHeightOffset: 0,
      toolbar: {
        show: true,
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
      name: "Temperature",
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
        format: 'HH:mm'
      },
    },
    yaxis: {
      labels: {
        padding: 4,
      },
      title: {
        text: 'Temperature (°C)'
      }
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
    <Layout>
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Temperature Details</h3>
              <p className={`card-subtitle ${isStaleData ? 'status status-red' : ''}`} 
                 style={{ 
                   fontSize: "x-small",
                   ...(isStaleData && { 
                     height: "18px",
                     padding: "0 5px"
                   })
                 }}>
                {isStaleData && <span className="status-dot status-dot-animated"></span>}
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-auto">
                <div className="card">
                  <div className="card-body p-2 text-center">
                    <div className="text-muted mb-1">Current</div>
                    <div className="h3 m-0">{currentTemp}°C</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="card">
                  <div className="card-body p-2 text-center">
                    <div className="text-muted mb-1">24h Max</div>
                    <div className="h3 m-0">{stats.max}°C</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="card">
                  <div className="card-body p-2 text-center">
                    <div className="text-muted mb-1">24h Min</div>
                    <div className="h3 m-0">{stats.min}°C</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="card">
                  <div className="card-body p-2 text-center">
                    <div className="text-muted mb-1">24h Avg</div>
                    <div className="h3 m-0">{stats.avg}°C</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ height: '400px' }}>
              {typeof window !== 'undefined' && (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartOptions.series} 
                  type="line" 
                  height={400} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TemperaturePage;