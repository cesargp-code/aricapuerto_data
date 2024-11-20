import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import { IconArrowNarrowUp } from '@tabler/icons-react';
import WaveDirectionStrip from './WaveDirectionStrip';
import { TimeRangeContext } from '../contexts/TimeRangeContext';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WaveHeightChart = () => {
  const { timeRange } = useContext(TimeRangeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allChartData, setAllChartData] = useState([]);
  const [displayedChartData, setDisplayedChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWaveHeight, setCurrentWaveHeight] = useState('-');
  const [waveDirChartData, setWaveDirChartData] = useState([]);
  const [currentWaveDir, setCurrentWaveDir] = useState('-');
  const [currentWavePeriod, setCurrentWavePeriod] = useState('-');
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

    // Update wave direction data
    const filteredDirData = filteredData.map(point => ({
      x: point.x,
      y: point.direction
    }));
    setWaveDirChartData(filteredDirData);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/home-waves-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
  
      // Format data for wave height chart with direction and period included
      const formattedWaveHeightData = data.reverse().map(item => ({
        x: new Date(item.created_at).getTime(),
        y: item.VAVH ? item.VAVH / 100 : null,  // Convert cm to m, null remains null
        direction: item.VDIR ? Math.round(item.VDIR) : null,
        period: item.VAVT ? Math.round(item.VAVT) : null
      }));
  
      setAllChartData(formattedWaveHeightData);
      setDisplayedChartData(formattedWaveHeightData);
  
      // Format initial data for wave direction chart
      const formattedWaveDirData = formattedWaveHeightData.map(item => ({
        x: item.x,
        y: item.direction
      }));
      setWaveDirChartData(formattedWaveDirData);

      if (formattedWaveHeightData.length > 0) {
        const lastDataPoint = formattedWaveHeightData[formattedWaveHeightData.length - 1];
        const lastDataTime = new Date(lastDataPoint.x);
        const currentTime = new Date();
        const timeDifferenceMinutes = (currentTime - lastDataTime) / (1000 * 60);
        
        setIsStaleData(timeDifferenceMinutes >= 30);
        setCurrentWaveHeight(lastDataPoint.y.toFixed(2));
        setCurrentWaveDir(lastDataPoint.direction);
        setCurrentWavePeriod(lastDataPoint.period);
        setLastUpdated(lastDataTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Wave data:', error);
      setIsLoading(false);
    }
  };

  const chartOptionsHeight = {
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
      connectNulls: false,
    },
    series: [{
      name: "Wave Height",
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
    colors: ["#13A8E2"],
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
        const height = data.y !== null ? data.y.toFixed(2) : '-';
        const direction = data.direction !== null ? Math.round(data.direction).toString() : '-';
        const period = data.period !== null ? Math.round(data.period).toString() : '-';
        
        return `
          <div class="arrow_box">
            <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
            <div>${height} m</div>
            <div>${direction}°</div>
            <div>${period} s</div>
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
        <div className="card-header">
          <div>
            <h3 className="card-title">Oleaje</h3>
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
            <span className="status status-azure current-pill" id="current-wave-pill">
              <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                    style={isStaleData ? { backgroundColor: '#909090' } : {}}>
              </span>
              {currentWaveHeight} m
              <span className="d-inline-flex align-items-center gap-1">
                    <span style={{ transform: `rotate(${currentWaveDir + 180}deg)` }}>
                      <IconArrowNarrowUp
                        size={20}
                        stroke={2}
                      />
                    </span>
                  </span>
              | {currentWavePeriod} s
            </span>
            <IconCircleArrowRightFilled
              height={40}
              width={40}
              className="navigation_arrow"
            />
          </div>
        </div>
        <div className="card-body">
          <div id="chart-wave-height">
            {typeof window !== 'undefined' && (
              <ReactApexChart 
                options={chartOptionsHeight} 
                series={chartOptionsHeight.series} 
                type="line" 
                height={200} 
              />
            )}
          </div>
          <WaveDirectionStrip waveData={waveDirChartData} />
        </div>
      </>
      )}
    </div>
  );
};

export default WaveHeightChart;