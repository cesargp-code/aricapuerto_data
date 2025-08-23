import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '../components/Layout';
import WaveDirectionStrip from '../components/WaveDirectionStrip';
import WaveRose from '../components/WaveRose';
import PeriodRose from '../components/PeriodRose';
import { TimeRangeContext } from '../contexts/TimeRangeContext';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';
import { IconArrowNarrowUp } from '@tabler/icons-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WavesContent = () => {
  const { timeRange } = useContext(TimeRangeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allChartData, setAllChartData] = useState([]);
  const [displayedChartData, setDisplayedChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [waveDirChartData, setWaveDirChartData] = useState([]);
  const [currentWave, setCurrentWave] = useState({
    height: '-',
    direction: '-',
    maxHeight: '-',
    currentPeriod: '-',
  });
  const [isStaleData, setIsStaleData] = useState(false);
  const [stats, setStats] = useState({
    minWave: '-',
    maxWave: '-',
    minMaxHeight: '-',
    maxMaxHeight: '-',
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
      const waveHeights = filteredData.map(point => point.y).filter(h => h !== null);
      const maxHeights = filteredData.map(point => point.maxHeight).filter(h => h !== null);
      const periods = filteredData.map(point => point.period).filter(p => p !== null);
      setStats({
        minWave: waveHeights.length > 0 ? Math.min(...waveHeights).toFixed(1) : '-',
        maxWave: waveHeights.length > 0 ? Math.max(...waveHeights).toFixed(1) : '-',
        minMaxHeight: maxHeights.length > 0 ? Math.min(...maxHeights).toFixed(1) : '-',
        maxMaxHeight: maxHeights.length > 0 ? Math.max(...maxHeights).toFixed(1) : '-',
        minPeriod: periods.length > 0 ? Math.min(...periods).toFixed(1) : '-',
        maxPeriod: periods.length > 0 ? Math.max(...periods).toFixed(1) : '-',
      });
    } else {
      setStats({
        minWave: '-',
        maxWave: '-',
        minMaxHeight: '-',
        maxMaxHeight: '-',
        minPeriod: '-',
        maxPeriod: '-',
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
        y: item.VAVH ? item.VAVH / 100 : null,
        maxHeight: item.VMXL ? item.VMXL / 100 : null,
        direction: parseFloat(item.VDIR),
        period: item.VAVT ? parseFloat(item.VAVT) : null, // VAVT is already a number from API
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
        
        setIsStaleData(timeDifferenceMinutes >= 35);
        setCurrentWave({
          height: lastDataPoint.y !== null ? lastDataPoint.y.toFixed(1) : '-',
          direction: Math.round(lastDataPoint.direction),
          maxHeight: lastDataPoint.maxHeight !== null ? lastDataPoint.maxHeight.toFixed(1) : '-',
          currentPeriod: lastDataPoint.period !== null ? Math.round(lastDataPoint.period).toString() : '-',
        });
        setLastUpdated(lastDataTime.toLocaleTimeString([], {
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }));

        // Initial statistics
        const waveHeights = formattedData.map(point => point.y).filter(h => h !== null);
        const maxHeights = formattedData.map(point => point.maxHeight).filter(h => h !== null);
        const periods = formattedData.map(point => point.period).filter(p => p !== null);

        setStats({
          minWave: waveHeights.length > 0 ? Math.min(...waveHeights).toFixed(1) : '-',
          maxWave: waveHeights.length > 0 ? Math.max(...waveHeights).toFixed(1) : '-',
          minMaxHeight: maxHeights.length > 0 ? Math.min(...maxHeights).toFixed(1) : '-',
          maxMaxHeight: maxHeights.length > 0 ? Math.max(...maxHeights).toFixed(1) : '-',
          minPeriod: periods.length > 0 ? Math.min(...periods).toFixed(1) : '-',
          maxPeriod: periods.length > 0 ? Math.max(...periods).toFixed(1) : '-',
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
      type: 'bars',
      fontFamily: 'inherit',
      id: 'waves_chart_height',
      group: 'waves_sync',
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
        formatter: function (val) {
          return val !== null && !isNaN(val) ? Math.round(val) + " m" : "0 m";
        }
      },
      min: 0,
    },
    colors: ["#1E40AF", "#13A8E2"],
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
    
        const originalDataPoint = displayedChartData.find(p => p.x === timestamp);

        if (!originalDataPoint) return '';
        
        const maxHeightValue = originalDataPoint.maxHeight !== null ? originalDataPoint.maxHeight.toFixed(2) : '-';
        const heightValue = originalDataPoint.y !== null ? originalDataPoint.y.toFixed(2) : '-';
        const directionValue = originalDataPoint.direction !== null ? originalDataPoint.direction.toFixed(0) : '-';
        
        let tooltipHtml = `<div class="arrow_box">
                             <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>`;

        tooltipHtml += `<div><span class="status-dot" style="background-color:${w.globals.colors[0]}"></span> Alt. Sig.: ${heightValue} m</div>`;
        tooltipHtml += `<div><span class="status-dot" style="background-color:${w.globals.colors[1]}"></span> Alt. Max.: ${maxHeightValue} m</div>`;
        tooltipHtml += `<div><span class="status-dot" style="opacity:0;"></span> Dir.: ${directionValue}°</div>`;
        tooltipHtml += `</div>`;

        return tooltipHtml;
      }
    },
  };

  const periodChartOptions = {
    chart: {
      type: 'bar',
      id: 'waves_chart_period',
      fontFamily: 'inherit',
      //group: 'waves_sync',
      height: 120,
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
    plotOptions: {
      bar: {
        borderRadius: 2,
        columnWidth: '60%',
      }
    },
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
        formatter: function (val) {
          return val !== null && !isNaN(val) ? Math.round(val) + " s" : "0 s";
        }
      }
    },
    colors: ["#20c997"],
    legend: {
      show: false,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const timestamp = w.config.series[seriesIndex].data[dataPointIndex].x;
        const periodValue = series[seriesIndex][dataPointIndex];
        const time = new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        return `
          <div class="arrow_box">
            <div class="arrow_box_header" style="font-weight: bold;">${time} h</div>
            <div><span class="status-dot" style="background-color:${w.globals.colors[0]}"></span> Periodo: ${periodValue !== null ? periodValue.toFixed(1) : '-'} s</div>
          </div>
        `;
      }
    }
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
            <span className="status current-pill" id="current-wave-pill">
              <span className={`status-dot ${!isStaleData ? 'status-dot-animated' : ''}`}
                    style={isStaleData ? { backgroundColor: '#909090' } : { backgroundColor: '#1E40AF' }}>
              </span>
              {currentWave.height} m 
                <span style={{ transform: `rotate(${currentWave.direction + 180}deg)` }}>
                  <IconArrowNarrowUp
                    size={20}
                    stroke={2}
                  />
                </span>
              <span className="d-inline-flex align-items-center gap-1">
              </span>
            </span>
          </div>
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-2 mb-3">
                <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#13A8E2' }}></span>
                        <span className="fs-5">Mín. altura máx.</span>
                      </div>
                      <div className="h3 m-0">{stats.minMaxHeight} m</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#13A8E2' }}></span>
                        <span className="fs-5">Máx. altura máx.</span>
                      </div>
                      <div className="h3 m-0">{stats.maxMaxHeight} m</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#1E40AF' }}></span>
                        <span className="fs-5">Mín. altura sig.</span>
                      </div>
                      <div className="h3 m-0">{stats.minWave} m</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#1E40AF' }}></span>
                        <span className="fs-5">Máx. altura sig.</span>
                      </div>
                      <div className="h3 m-0">{stats.maxWave} m</div>
                    </div>
                  </div>
                </div>
                <div id="chart-wave-height">
                  {typeof window !== 'undefined' && displayedChartData.length > 0 && (
                    <ReactApexChart 
                      key={`height-chart-${displayedChartData.length}-${timeRange}`}
                      options={chartOptions} 
                      series={[
                        {
                          name: "Altura significativa",
                          data: displayedChartData.map(point => ({ x: point.x, y: point.y }))
                        },
                        {
                          name: "Altura máxima",
                          data: displayedChartData.map(point => ({ x: point.x, y: point.maxHeight }))
                        }
                      ]}
                      type="line" 
                      height={200} 
                    />
                  )}
                </div>
                <WaveDirectionStrip waveData={waveDirChartData} />
                <div className="row g-2 mb-3 mt-4">
                <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#20c997' }}></span>
                        <span className="fs-5">Mín. periodo</span>
                      </div>
                      <div className="h3 m-0">{stats.minPeriod} s</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                        <span className="status-dot" style={{ backgroundColor: '#20c997' }}></span>
                        <span className="fs-5">Máx. periodo</span>
                      </div>
                      <div className="h3 m-0">{stats.maxPeriod} s</div>
                    </div>
                  </div>
                </div>
                <div id="chart-wave-period">
                  {typeof window !== 'undefined' && displayedChartData.length > 0 && (
                    <ReactApexChart
                      key={`period-chart-${displayedChartData.length}-${timeRange}`}
                      options={periodChartOptions}
                      series={[{ name: "Periodo", data: displayedChartData.map(point => ({ x: point.x, y: point.period })) }]}
                      type="bar"
                      height={120}
                    />
                  )}
                </div>
                
              </div>
            </div>
          </div>
          <div className="col-12">
            <WaveRose data={displayedChartData} />
          </div>
          <div className="col-12">
            <PeriodRose data={displayedChartData} />
          </div>
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