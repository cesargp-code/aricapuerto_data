import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import { IconArrowNarrowUp } from '@tabler/icons-react';
import Link from 'next/link';
import WindDirectionStrip from './WindDirectionStrip';
import { TimeRangeContext } from '../contexts/TimeRangeContext';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WindSpeedChart = () => {
  const { timeRange } = useContext(TimeRangeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allChartData, setAllChartData] = useState([]);
  const [displayedChartData, setDisplayedChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWindSpeed, setCurrentWindSpeed] = useState('-');
  const [windDirChartData, setWindDirChartData] = useState([]);
  const [currentWindDir, setCurrentWindDir] = useState('-');
  const [isStaleData, setIsStaleData] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allChartData.length > 0) {
      filterDataByTimeRange(timeRange);
    }
  }, [timeRange, allChartData]);

  const filterDataByTimeRange = (hours) => {
    const now = new Date(allChartData[allChartData.length - 1].x);
    const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    const filteredData = allChartData.filter(point => new Date(point.x) >= cutoff);
    setDisplayedChartData(filteredData);

    // Update wind direction data
    const filteredDirData = filteredData.map(point => ({
      x: point.x,
      y: point.direction
    }));
    setWindDirChartData(filteredDirData);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/home-wind-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
  
      // Format data for wind speed chart with direction included
      const formattedWindSpeedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: parseFloat(item.WSPD),
        direction: parseFloat(item.WDIR)
      }));
  
      setAllChartData(formattedWindSpeedData);
      setDisplayedChartData(formattedWindSpeedData);
  
      // Format initial data for wind direction chart
      const formattedWindDirData = formattedWindSpeedData.map(item => ({
        x: item.x,
        y: item.direction
      }));
      setWindDirChartData(formattedWindDirData);
  
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
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
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
      data: displayedChartData
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
          hour12: false
        });
        const speed = data.y !== null ? data.y.toFixed(1) : '-';
        const direction = data.direction !== null ? data.direction.toFixed(0) : '-';
        
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
    <div className="card">
      {isLoading ? (
        <div className="page page-center" id="loading">
          <div className="container container-slim py-3">
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
          <Link href="/wind" className="text-decoration-none">
            <div className="card-header">
              <div>
                <h3 className="card-title text-decoration-none">Viento</h3>
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
                <span className="status status-teal current-pill" id="current-wind-pill">
                  <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                        style={isStaleData ? { backgroundColor: '#909090' } : {}}>
                  </span>
                  {currentWindSpeed} m/s
                  <span className="d-inline-flex align-items-center gap-1">
                    <span style={{ transform: `rotate(${currentWindDir}deg)` }}>
                      <IconArrowNarrowUp
                        size={20}
                        stroke={2}
                      />
                    </span>
                  </span>
                </span>
                <IconCircleArrowRightFilled
                  height={40}
                  width={40}
                  className="navigation_arrow"
                />
              </div>
            </div>
          </Link>
          <div className="card-body">
            <div id="chart-wind-speed">
              {typeof window !== 'undefined' && (
                <ReactApexChart options={chartOptionsSpeed} series={chartOptionsSpeed.series} type="line" height={200} />
              )}
            </div>
            <WindDirectionStrip windDirData={windDirChartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default WindSpeedChart;