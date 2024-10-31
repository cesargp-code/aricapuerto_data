import React, { useMemo } from 'react';

const WindRose = ({ data }) => {
  // Process data into direction/speed bins
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Initialize direction bins (every 22.5 degrees - 16 directions)
    // Shifted by -11.25 degrees so bins are centered on cardinal directions
    const bins = Array(16).fill(0).map(() => ({
      count: 0,
      speeds: {
        calm: 0,      // 0-2 m/s
        light: 0,     // 2-4 m/s
        moderate: 0,  // 4-6 m/s
        fresh: 0,     // 6-8 m/s
        strong: 0,    // 8-10 m/s
        nearGale: 0,  // 10-12 m/s
        gale: 0,      // 12-14 m/s
        severe: 0     // >14 m/s
      }
    }));
    
    // Process each data point
    data.forEach(point => {
      const direction = point.direction;
      const speed = point.y;
      
      // Calculate which bin this direction belongs to
      // Add 360 before modulo to handle negative angles after the -11.25 shift
      const binIndex = Math.floor(((direction + 360 - 11.25) % 360) / 22.5);
      
      bins[binIndex].count++;
      
      // Categorize speed
      if (speed <= 2) bins[binIndex].speeds.calm++;
      else if (speed <= 4) bins[binIndex].speeds.light++;
      else if (speed <= 6) bins[binIndex].speeds.moderate++;
      else if (speed <= 8) bins[binIndex].speeds.fresh++;
      else if (speed <= 10) bins[binIndex].speeds.strong++;
      else if (speed <= 12) bins[binIndex].speeds.nearGale++;
      else if (speed <= 14) bins[binIndex].speeds.gale++;
      else bins[binIndex].speeds.severe++;
    });
    
    // Convert counts to percentages
    const total = data.length;
    return bins.map(bin => ({
      ...bin,
      percentage: (bin.count / total) * 100,
      speeds: {
        calm: (bin.speeds.calm / total) * 100,
        light: (bin.speeds.light / total) * 100,
        moderate: (bin.speeds.moderate / total) * 100,
        fresh: (bin.speeds.fresh / total) * 100,
        strong: (bin.speeds.strong / total) * 100,
        nearGale: (bin.speeds.nearGale / total) * 100,
        gale: (bin.speeds.gale / total) * 100,
        severe: (bin.speeds.severe / total) * 100
      }
    }));
  }, [data]);

  // Early return if no data
  if (!processedData) return <div>No data available</div>;

  // Calculate maximum percentage for scaling
  const maxPercentage = Math.max(...processedData.map(bin => bin.percentage));
  
  // Generate the SVG paths for each speed category
  const generatePaths = (speedKey, color) => {
    const paths = processedData.map((bin, index) => {
      const angle = ((index * 22.5 - 11.25) * Math.PI) / 180;
      const nextAngle = (((index + 1) * 22.5 - 11.25) * Math.PI) / 180;
      const percentage = bin.speeds[speedKey];
      const radius = (percentage * 120) / maxPercentage;
      
      const x1 = 150 + radius * Math.sin(angle);
      const y1 = 150 - radius * Math.cos(angle);
      const x2 = 150 + radius * Math.sin(nextAngle);
      const y2 = 150 - radius * Math.cos(nextAngle);
      
      return `M 150,150 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    }).join(' ');

    return <path d={paths} fill={color} opacity={0.7} />;
  };

  const windSpeedColors = [
    { key: 'calm', color: '#E1E7CE', label: '0-2 m/s' },        // Lightest green
    { key: 'light', color: '#A5C58F', label: '2-4 m/s' },      // Lighter green
    { key: 'moderate', color: '#54A151', label: '4-6 m/s' },   // Green
    { key: 'fresh', color: '#157B37', label: '6-8 m/s' },      // Light green
    { key: 'strong', color: '#116D43', label: '8-10 m/s' },    // Light orange
    { key: 'nearGale', color: '#0D5F4B', label: '10-12 m/s' }, // Orange
    { key: 'gale', color: '#0A504E', label: '12-14 m/s' },    // Light red
    { key: 'severe', color: '#073641', label: '>14 m/s' }     // Red
  ];

  return (
    <div className="card">
        <div className='card-header'>
            <h3 className="card-title">Distribución del viento</h3>
        </div>
      <div className="card-body">
        <div className="d-flex flex-column align-items-center">
          <svg viewBox="0 0 300 300" style={{ maxWidth: '500px', width: '100%' }}>
            {/* Background reference lines */}
            <line x1="150" y1="30" x2="150" y2="270" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="30" y1="150" x2="270" y2="150" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="64" y1="64" x2="236" y2="236" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="236" y1="64" x2="64" y2="236" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Render concentric circles for reference */}
            {[25, 50, 75, 100].map((radius, i) => (
              <circle
                key={i}
                cx="150"
                cy="150"
                r={radius * 1.2}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Direction labels */}
            <text x="150" y="25" textAnchor="middle" className="text-muted x-small">N</text>
            <text x="275" y="155" textAnchor="start" className="text-muted x-small">E</text>
            <text x="150" y="285" textAnchor="middle" className="text-muted">S</text>
            <text x="25" y="155" textAnchor="end" className="text-muted">W</text>
            
            {/* NE, SE, SW, NW labels */}
            <text x="235" y="75" textAnchor="middle" className="text-muted">NE</text>
            <text x="235" y="235" textAnchor="middle" className="text-muted">SE</text>
            <text x="65" y="235" textAnchor="middle" className="text-muted">SW</text>
            <text x="65" y="75" textAnchor="middle" className="text-muted">NW</text>
            
            {/* Speed category layers - now rendering from fastest to slowest */}
            {[...windSpeedColors].reverse().map(({key, color}) => generatePaths(key, color))}
          </svg>
          
          {/* Legend - keep original order for readability */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            {windSpeedColors.map(({key, color, label}) => (
              <div key={key} className="d-flex align-items-center me-3">
                <span 
                  className="me-2" 
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    backgroundColor: color,
                    borderRadius: '2px'
                  }}
                ></span>
                <span className="text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindRose;