import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const PressurePage = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentPressure, setCurrentPressure] = useState('-');
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
      const response = await fetch('/api/pressure-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      // Format data for the chart
      const formattedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.ATMS)
      }));

      setChartData(formattedData);

      if (formattedData.length > 0) {
        const lastDataPoint = formattedData[formattedData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentPressure(lastDataPoint.y.toFixed(1));
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        // Calculate statistics
        const pressures = formattedData.map(point => point.y);
        setStats({
          min: Math.min(...pressures).toFixed(1),
          max: Math.max(...pressures).toFixed(1),
          avg: (pressures.reduce((a, b) => a + b, 0) / pressures.length).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error fetching pressure data:', error);
    }
  };

  const chartOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      height: 200,
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
      name: "Presión at.",
      data: chartData
    }],
    grid: {
      padding: {
        top: 0,
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
      tooltip: {
        enabled: false
      },
    },
    yaxis: {
      labels: {
        padding: 4,
      },
    },
    colors: ["#2C3976"],
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
          const pressure = data.y.toFixed(1);
          
          return `
            <div class="arrow_box">
              <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
              <div>${pressure} hPa</div>
            </div>
          `;
        }
      },
  };

  return (
    <Layout>
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Presión atmosférica</h3>
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
              <span className="status status-azure current-pill">
                <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                      style={isStaleData ? { backgroundColor: '#909090' } : {}}>
                </span>
                {currentPressure} hPa
              </span>
            </div>
          </div>
          <div className="card-body">
          <div className="row g-0 mb-3">
            <div className="col-4">
                <div className="card">
                <div className="card-body p-2 text-center">
                    <div className="text-muted text-secondary fs-5">Mínima</div>
                    <div className="h2 m-0">{stats.min}°C</div>
                </div>
                </div>
            </div>
            <div className="col-4">
                <div className="card">
                <div className="card-body p-2 text-center">
                    <div className="text-muted text-secondary fs-5">Máxima</div>
                    <div className="h2 m-0">{stats.max}°C</div>
                </div>
                </div>
            </div>
            <div className="col-4">
                <div className="card">
                <div className="card-body p-2 text-center">
                    <div className="text-muted text-secondary fs-5">Media</div>
                    <div className="h2 m-0">{stats.avg}°C</div>
                </div>
                </div>
            </div>
            </div>
            <div style={{ height: '200px' }}>
              {typeof window !== 'undefined' && (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartOptions.series} 
                  type="line" 
                  height={200} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PressurePage;