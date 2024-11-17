import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '../components/Layout';
import { TimeRangeContext } from '../contexts/TimeRangeContext';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TemperatureContent = () => {
  const { timeRange } = useContext(TimeRangeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allChartData, setAllChartData] = useState([]);
  const [displayedChartData, setDisplayedChartData] = useState([]);
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

    // Update statistics for the filtered range
    const temperatures = filteredData.map(point => point.y);
    setStats({
      min: Math.min(...temperatures).toFixed(1),
      max: Math.max(...temperatures).toFixed(1),
      avg: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)
    });
  };

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

      setAllChartData(formattedData);
      setDisplayedChartData(formattedData); // Initially show all data

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

        // Initial statistics will be for 24h
        const temperatures = formattedData.map(point => point.y);
        setStats({
          min: Math.min(...temperatures).toFixed(1),
          max: Math.max(...temperatures).toFixed(1),
          avg: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setIsLoading(false);
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
      data: displayedChartData // Use filtered data here
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
          hour12: false
        });
        const temperature = data.y !== null ? data.y.toFixed(1) : '-';
        
        return `
          <div class="arrow_box">
            <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
            <div>${temperature} ºC</div>
          </div>
        `;
      }
    },
  };

  return (
    <>
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
        <div>
          <div className='title d-flex align-items-center justify-content-between w-100 mb-3'>
            <div className="d-flex align-items-center">
              <Link href="/" className="text-decoration-none d-flex align-items-center">
                <IconCircleArrowLeftFilled
                  height={40}
                  width={40}
                  className="navigation_arrow me-1"
                />
                <div>
                  <h2 id='page-title' className='mb-0 text-decoration-none'>Temperatura</h2>
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
            <span className="status status-azure current-pill">
              <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                    style={isStaleData ? { backgroundColor: '#909090' } : {}}>
              </span>
              {currentTemp} ºC
            </span>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="p-3 bg-light rounded-2 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                      <span className="fs-5">Mínima</span>
                    </div>
                    <div className="h3 m-0">{stats.min} ºC</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-2 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                      <span className="fs-5">Media</span>
                    </div>
                    <div className="h3 m-0">{stats.avg} ºC</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-2 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                      <span className="fs-5">Máxima</span>
                    </div>
                    <div className="h3 m-0">{stats.max} ºC</div>
                  </div>
                </div>
              </div>
              <div id="chart-temperature">
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
      )}
    </>
  );
};

// Wrapper component that provides the Layout
const TemperaturePage = () => {
  return (
    <Layout>
      <TemperatureContent />
    </Layout>
  );
};

export default TemperaturePage;