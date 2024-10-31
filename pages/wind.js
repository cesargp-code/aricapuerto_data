import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import WindRose from '../components/WindRose';
import Layout from '../components/Layout';
import WindDirectionStrip from '../components/WindDirectionStrip';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WindPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [windDirChartData, setWindDirChartData] = useState([]);
  const [currentWind, setCurrentWind] = useState({
    speed: '-',
    direction: '-',
    gust: '-',
    gustDir: '-'
  });
  const [isStaleData, setIsStaleData] = useState(false);
  const [stats, setStats] = useState({
    minWind: '-',
    maxWind: '-',
    minGust: '-',
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

      // Format data for wind direction strip
      const formattedWindDirData = formattedData.map(point => ({
        x: point.x,
        y: point.direction
      }));
      setWindDirChartData(formattedWindDirData);

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
          minWind: Math.min(...windSpeeds).toFixed(1),
          maxWind: Math.max(...windSpeeds).toFixed(1),
          minGust: Math.min(...gusts).toFixed(1),
          maxGust: Math.max(...gusts).toFixed(1),
        });
      }
      setIsLoading(false); // Add this line at the end of successful data processing
    } catch (error) {
      console.error('Error fetching wind data:', error);
      setIsLoading(false); // Also set loading to false on error
    }
  };

  const chartOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      height: 200,
      zoom: false,
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
      width: [2, 2],
      lineCap: "round",
      curve: "smooth",
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
      type: 'numeric',
      tickAmount: 8,
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
    colors: ["#157B37", "#43F37C"],
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
      {isLoading ? (
        <div className="page page-center">
          <div className="container container-slim py-4">
            <div className="text-center">
              <div className="text-secondary mb-3">Cargando datos...</div>
              <div className="progress progress-sm">
                <div className="progress-bar progress-bar-indeterminate"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className='title d-flex align-items-center justify-content-between w-100 mb-3'>
        <div className="d-flex align-items-center">
        <Link href="/" className="text-decoration-none d-flex align-items-center">
          <IconCircleArrowLeftFilled
            size={40}
            className="navigation_arrow me-1"
          />
          <div>
            <h2 className='mb-0 text-decoration-none'>Viento</h2>
            <p className={`card-subtitle mb-0 ${isStaleData ? 'status status-red' : ''}`} 
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
        </Link>
        </div>
        <span className="status status-teal current-pill" id="current-wind-pill">
          <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                style={isStaleData ? { backgroundColor: '#909090' } : {}}>
          </span>
          {currentWind.speed} m/s | {currentWind.gust} m/s | {currentWind.direction}°
        </span>
      </div>
      <div className="col-12">
        <div className="card">
          <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="p-3 bg-light rounded-2 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                  <span className="status-dot" style={{ backgroundColor: '#157B37' }}></span>
                  <span className="fs-5">Mín. viento</span>
                </div>
                <div className="h3 m-0">{stats.minWind} m/s</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-light rounded-2 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                  <span className="status-dot" style={{ backgroundColor: '#157B37' }}></span>
                  <span className="fs-5">Máx. viento</span>
                </div>
                <div className="h3 m-0">{stats.maxWind} m/s</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-light rounded-2 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                  <span className="status-dot" style={{ backgroundColor: '#43F37C' }}></span>
                  <span className="fs-5">Mín. racha</span>
                </div>
                <div className="h3 m-0">{stats.minGust} m/s</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-light rounded-2 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                  <span className="status-dot" style={{ backgroundColor: '#43F37C' }}></span>
                  <span className="fs-5">Máx. racha</span>
                </div>
                <div className="h3 m-0">{stats.maxGust} m/s</div>
              </div>
            </div>
          </div>
            <div id="chart-wind-speed">
              {typeof window !== 'undefined' && (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartOptions.series} 
                  type="line" 
                  height={200} 
                />
              )}
            </div>
            <WindDirectionStrip windDirData={windDirChartData} />
          </div>
        </div>
      </div>
      <div className="col-12">
            <WindRose data={chartData} />
            </div>
      </>
    )}
  </Layout>
);
};

export default WindPage;