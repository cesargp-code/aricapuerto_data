import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { IconArrowUpCircle } from '@tabler/icons-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WindPage = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWind, setCurrentWind] = useState({
    speed: '-',
    direction: '-',
    gust: '-',
    gustDir: '-'
  });
  const [isStaleData, setIsStaleData] = useState(false);
  const [stats, setStats] = useState({
    maxWind: '-',
    avgWind: '-',
    maxGust: '-',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/wind-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      // Format data for the chart
      const formattedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.WSPD),
        gust: parseFloat(item.GSPD),
        direction: parseFloat(item.WDIR),
        gustDir: parseFloat(item.GDIR)
      }));

      setChartData(formattedData);

      if (formattedData.length > 0) {
        const lastDataPoint = formattedData[formattedData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentWind({
          speed: lastDataPoint.y.toFixed(1),
          direction: Math.round(lastDataPoint.direction),
          gust: lastDataPoint.gust.toFixed(1),
          gustDir: Math.round(lastDataPoint.gustDir)
        });
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        // Calculate statistics
        const windSpeeds = formattedData.map(point => point.y);
        const gusts = formattedData.map(point => point.gust);
        setStats({
          maxWind: Math.max(...windSpeeds).toFixed(1),
          avgWind: (windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toFixed(1),
          maxGust: Math.max(...gusts).toFixed(1),
        });
      }
    } catch (error) {
      console.error('Error fetching wind data:', error);
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
    stroke: {
      width: [2, 1],
      lineCap: "round",
      curve: "smooth",
      dashArray: [0, 3]
    },
    series: [
      {
        name: "Viento",
        data: chartData.map(point => ({ x: point.x, y: point.y }))
      },
      {
        name: "Racha",
        data: chartData.map(point => ({ x: point.x, y: point.gust }))
      }
    ],
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
      tooltip: false,
    },
    yaxis: {
      labels: {
        padding: 4,
      },
    },
    colors: ["#157B37", "#206bc4"],
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
              <h3 className="card-title">Viento</h3>
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
                {currentWind.speed} m/s | {currentWind.direction}°
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="card-group mb-3" style={{ flex: '0 0 auto', flexWrap: 'nowrap' }}>
              <div className="card">
                <div className="card-body p-2 text-center">
                  <div className="text-muted text-secondary fs-5">Máxima viento</div>
                  <div className="h2 m-0">{stats.maxWind} m/s</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body p-2 text-center">
                  <div className="text-muted text-secondary fs-5">Media viento</div>
                  <div className="h2 m-0">{stats.avgWind} m/s</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body p-2 text-center">
                  <div className="text-muted text-secondary fs-5">Máxima racha</div>
                  <div className="h2 m-0">{stats.maxGust} m/s</div>
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
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-center">
                <div className="text-muted mb-1">Dirección viento</div>
                <div style={{ transform: `rotate(${currentWind.direction}deg)` }}>
                  <IconArrowUpCircle size={48} color="#157B37" />
                </div>
                <div>{currentWind.direction}°</div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1">Dirección racha</div>
                <div style={{ transform: `rotate(${currentWind.gustDir}deg)` }}>
                  <IconArrowUpCircle size={48} color="#206bc4" />
                </div>
                <div>{currentWind.gustDir}°</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WindPage;