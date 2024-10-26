import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WaveDirectionStrip from './WaveDirectionStrip';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WaveHeightChart = () => {
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentWaveHeight, setCurrentWaveHeight] = useState('-');
  const [waveDirChartData, setWaveDirChartData] = useState([]);
  const [currentWaveDir, setCurrentWaveDir] = useState('-');
  const [currentWavePeriod, setCurrentWavePeriod] = useState('-');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Fetching wave data started');
    try {
      const response = await fetch('/api/waves-data');
      console.log('Fetch response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      console.log('Wave data received:', data);
  
        // Format data for wave height chart with direction and period included
        const formattedWaveHeightData = data.reverse().map(item => ({
            x: new Date(item.created_at).getTime(),
            y: parseFloat(item.VAVH) / 100,  // Convert cm to m
            direction: Math.round(parseFloat(item.VDIR)),  // Round to integer
            period: Math.round(parseFloat(item.VAVT))      // Round to integer
        }));

        // Format data for wave direction chart
        const formattedWaveDirData = data.map(item => ({
            x: new Date(item.created_at).getTime(),
            y: Math.round(parseFloat(item.VDIR))  // Round to integer
        }));
      console.log('Formatted wave direction data:', formattedWaveDirData);
  
      setChartData(formattedWaveHeightData);
      setWaveDirChartData(formattedWaveDirData);
      console.log('Wave chart data set:', formattedWaveHeightData);
  
      if (formattedWaveHeightData.length > 0) {
        const lastDataPoint = formattedWaveHeightData[formattedWaveHeightData.length - 1];
        const lastWaveDir = formattedWaveDirData[formattedWaveDirData.length - 1].y;
        
        setCurrentWaveHeight(lastDataPoint.y);
        setCurrentWaveDir(lastWaveDir);
        setCurrentWavePeriod(lastDataPoint.period);
        setLastUpdated(new Date(lastDataPoint.x).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        console.log('No data points available');
      }
    } catch (error) {
      console.error('Error fetching Wave data:', error);
    }
    console.log('Fetching Wave data completed');
  };

  const chartOptionsHeight = {
    
    chart: {
        type: 'area',
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
      plotOptions: {
        area: {
          fillTo: 'end'
        }
      },
      colors: ['#206bc4'],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        enabled: true,  // Explicitly enable fill
        type: 'pattern',
        opacity: 1,     // Ensure opacity is set
        pattern: {
          enabled: true,  // Explicitly enable pattern
          style: 'verticalLines',
          width: 6,
          height: 6,
          strokeWidth: 2
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
      name: "Wave Height",
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
    },
    colors: ["#555555"], // Changed to ocean blue
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
        const height = data.y.toFixed(2);
        const direction = data.direction.toString();
        const period = data.period.toString();
        
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
    <div className="card" id="home_wave">
      <div className="card-header">
        <div>
          <h3 className="card-title">Oleaje (m)</h3>
          <p className="card-subtitle" style={{ fontSize: "x-small" }}>actualizado {lastUpdated}</p>
        </div>
        <div className="card-actions">
          <span className="status status-azure" 
                style={{ fontSize: "medium", 
                         color: "#13A8E2", 
                         height: "34px", 
                         backgroundColor:"#DCF2FB" }}>
            <span className="status-dot status-dot-animated"></span>
            {currentWaveHeight} m  |  {currentWaveDir}° | {currentWavePeriod} s
          </span>
        </div>
      </div>
      <div className="card-body">
        <div id="chart-wave-height">
          {typeof window !== 'undefined' && (
            <ReactApexChart options={chartOptionsHeight} series={chartOptionsHeight.series} type="line" height={200} />
          )}
        </div>
        <WaveDirectionStrip waveData={waveDirChartData} />
      </div>
    </div>
  );
};

export default WaveHeightChart;