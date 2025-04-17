import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '../components/Layout';
import WaveDirectionStrip from '../components/WaveDirectionStrip';
import { TimeRangeContext } from '../contexts/TimeRangeContext';
import { useAuth } from '../contexts/AuthContext';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';
import { IconFileDownload } from '@tabler/icons-react';
import { downloadCSV } from '../utils/csvUtils';
import { IconArrowNarrowUp } from '@tabler/icons-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WavesContent = () => {
  const { timeRange } = useContext(TimeRangeContext);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [allChartData, setAllChartData] = useState([]);
  const [displayedChartData, setDisplayedChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [waveDirChartData, setWaveDirChartData] = useState([]);
  const [currentWave, setCurrentWave] = useState({
    height: '-',
    direction: '-',
    period: '-'
  });
  const [isStaleData, setIsStaleData] = useState(false);
  const [stats, setStats] = useState({
    minHeight: '-',
    maxHeight: '-',
    minPeriod: '-',
    maxPeriod: '-',
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

    // Update wave direction data for strip
    const filteredDirData = filteredData.map(point => ({
      x: point.x,
      y: point.direction
    }));
    setWaveDirChartData(filteredDirData);

    // Update statistics for the filtered range
    if (filteredData.length > 0) {
      const waveHeights = filteredData.map(point => point.y);
      const wavePeriods = filteredData.map(point => point.period);
      setStats({
        minHeight: Math.min(...waveHeights).toFixed(2),
        maxHeight: Math.max(...waveHeights).toFixed(2),
        minPeriod: Math.min(...wavePeriods).toFixed(1),
        maxPeriod: Math.max(...wavePeriods).toFixed(1),
      });
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/waves-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      // Format data for the chart
      const formattedData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: item.VAVH ? item.VAVH / 100 : null,  // Convert cm to m
        direction: item.VDIR ? parseFloat(item.VDIR) : null,
        period: item.VAVT ? parseFloat(item.VAVT) : null
      }));

      setAllChartData(formattedData);
      setDisplayedChartData(formattedData); // Initial display with all data

      // Initial wave direction data
      const formattedWaveDirData = formattedData.map(point => ({
        x: point.x,
        y: point.direction
      }));
      setWaveDirChartData(formattedWaveDirData);

      if (formattedData.length > 0) {
        const lastDataPoint = formattedData[formattedData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentWave({
          height: lastDataPoint.y.toFixed(2),
          direction: Math.round(lastDataPoint.direction),
          period: lastDataPoint.period.toFixed(1)
        });
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        // Initial statistics
        const waveHeights = formattedData.map(point => point.y);
        const wavePeriods = formattedData.map(point => point.period);
        setStats({
          minHeight: Math.min(...waveHeights).toFixed(2),
          maxHeight: Math.max(...waveHeights).toFixed(2),
          minPeriod: Math.min(...wavePeriods).toFixed(1),
          maxPeriod: Math.max(...wavePeriods).toFixed(1),
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wave data:', error);
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
    stroke: {
      width: [2, 2],
      lineCap: "round",
      curve: "smooth",
    },
    series: [
      {
        name: "Altura",
        data: displayedChartData.map(point => ({ x: point.x, y: point.y }))
      },
      {
        name: "Período",
        data: displayedChartData.map(point => ({ x: point.x, y: point.period }))
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
    colors: ["#0F6F9B", "#13A8E2"],
    legend: {
      show: false,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const timestamp = w.config.series[seriesIndex].data[dataPointIndex].x;
        const time = new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
    
        // Find the original data point that contains all the information
        const originalDataPoint = displayedChartData[dataPointIndex];
        
        // Safely handle null values for each metric
        const heightValue = originalDataPoint.y !== null ? originalDataPoint.y.toFixed(2) : '-';
        const periodValue = originalDataPoint.period !== null ? originalDataPoint.period.toFixed(1) : '-';
        const directionValue = originalDataPoint.direction !== null ? originalDataPoint.direction.toFixed(0) : '-';
        
        return `
          <div class="arrow_box">
            <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
            <div><span class="status-dot" style="background-color:#0F6F9B"></span> ${heightValue} m</div>
            <div><span class="status-dot" style="background-color:#13A8E2"></span> ${periodValue} s</div>
            <div>${directionValue}°</div>
          </div>
        `;
      }
    },
  };

  const handleDownload = () => {
    const csvData = displayedChartData.map(point => ({
      date: point.x,
      waveHeight: point.y,
      waveDirection: point.direction,
      wavePeriod: point.period
    }));

    downloadCSV(csvData, {
      columns: {
        date: 'Fecha y hora',
        waveHeight: 'Altura de ola (m)',
        waveDirection: 'Dirección de ola (°)',
        wavePeriod: 'Período (s)'
      },
      filename: 'oleaje'
    });
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
        <>
          <div className='title d-flex align-items-center justify-content-between w-100 mb-3'>
            <div className="d-flex align-items-center">
              <Link href="/" className="text-decoration-none d-flex align-items-center">
                <IconCircleArrowLeftFilled
                  height={40}
                  width={40}
                  className="navigation_arrow me-1"
                />
                <div>
                  <h2 id='page-title' className='mb-0 text-decoration-none'>Oleaje</h2>
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
            <span className="status status-azure current-pill" id="current-wave-pill">
              <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                    style={isStaleData ? { backgroundColor: '#909090' } : {}}>
              </span>
              {currentWave.height} m | {currentWave.period} s
              <span className="d-inline-flex align-items-center gap-1">
                <span style={{ transform: `rotate(${currentWave.direction + 180}deg)` }}>
                  <IconArrowNarrowUp
                    size={20}
                    stroke={2}
                  />
                </span>
              </span>
            </span>
          </div>
          <div className="alert alert-warning mb-3">
            <div className="d-flex">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 9v2m0 4v.01"></path>
                  <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path>
                </svg>
              </div>
              <div>
                La boya de oleaje está actualmente en mantenimiento. Se muestran datos históricos. 
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#0F6F9B' }}></span>
                        <span className="fs-5">Mín. altura</span>
                      </div>
                      <div className="h3 m-0">{stats.minHeight} m</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#0F6F9B' }}></span>
                        <span className="fs-5">Máx. altura</span>
                      </div>
                      <div className="h3 m-0">{stats.maxHeight} m</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#13A8E2' }}></span>
                        <span className="fs-5">Mín. período</span>
                      </div>
                      <div className="h3 m-0">{stats.minPeriod} s</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#13A8E2' }}></span>
                        <span className="fs-5">Máx. período</span>
                      </div>
                      <div className="h3 m-0">{stats.maxPeriod} s</div>
                    </div>
                  </div>
                </div>
                <div id="chart-wave-height">
                  {typeof window !== 'undefined' && (
                    <ReactApexChart 
                      options={chartOptions} 
                      series={chartOptions.series} 
                      type="line" 
                      height={200} 
                    />
                  )}
                </div>
                <WaveDirectionStrip waveData={waveDirChartData} />
              </div>
            </div>
          </div>
          {user && (
            <div className="d-flex justify-content-center mt-3">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleDownload}
              >
                <IconFileDownload size={20} />
                Descargar datos
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

const WavesPage = () => {
  return (
    <Layout>
      <WavesContent />
    </Layout>
  );
};

export default WavesPage;