import React, { useMemo } from 'react';

const WaveRose = ({ data }) => {
  // Process data into direction/height bins
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Initialize direction bins (every 22.5 degrees - 16 directions)
    // Shifted by -11.25 degrees so bins are centered on cardinal directions
    const bins = Array(16).fill(0).map(() => ({
      count: 0,
      heights: {
        calm: 0,      // 0-0.5 m
        light: 0,     // 0.5-1 m
        moderate: 0,  // 1-1.5 m
        fresh: 0,     // 1.5-2 m
        strong: 0,    // 2-2.5 m
        high: 0,      // 2.5-3 m
        veryHigh: 0,  // 3-4 m
        extreme: 0    // >4 m
      }
    }));
    
    // Process each data point
    data.forEach(point => {
      const direction = point.direction;
      const height = point.y;
      
      // Skip if direction or height is null/undefined
      if (direction == null || height == null) return;
      
      // Calculate which bin this direction belongs to
      // Add 360 before modulo to handle negative angles after the -11.25 shift
      const binIndex = Math.floor(((direction + 360 - 11.25) % 360) / 22.5);
      
      bins[binIndex].count++;
      
      // Categorize height
      if (height <= 0.5) bins[binIndex].heights.calm++;
      else if (height <= 1) bins[binIndex].heights.light++;
      else if (height <= 1.5) bins[binIndex].heights.moderate++;
      else if (height <= 2) bins[binIndex].heights.fresh++;
      else if (height <= 2.5) bins[binIndex].heights.strong++;
      else if (height <= 3) bins[binIndex].heights.high++;
      else if (height <= 4) bins[binIndex].heights.veryHigh++;
      else bins[binIndex].heights.extreme++;
    });
    
    // Convert counts to percentages
    const total = data.filter(point => point.direction != null && point.y != null).length;
    if (total === 0) return null;
    
    return bins.map(bin => ({
      ...bin,
      percentage: (bin.count / total) * 100,
      heights: {
        calm: (bin.heights.calm / total) * 100,
        light: (bin.heights.light / total) * 100,
        moderate: (bin.heights.moderate / total) * 100,
        fresh: (bin.heights.fresh / total) * 100,
        strong: (bin.heights.strong / total) * 100,
        high: (bin.heights.high / total) * 100,
        veryHigh: (bin.heights.veryHigh / total) * 100,
        extreme: (bin.heights.extreme / total) * 100
      }
    }));
  }, [data]);

  // Early return if no data
  if (!processedData) return <div>No data available</div>;

  // Calculate maximum percentage for scaling
  const maxPercentage = Math.max(...processedData.map(bin => bin.percentage));
  
  // Generate the SVG paths for each height category
  const generatePaths = (heightKey, color) => {
    const paths = processedData.map((bin, index) => {
      const angle = ((index * 22.5 - 11.25) * Math.PI) / 180;
      const nextAngle = (((index + 1) * 22.5 - 11.25) * Math.PI) / 180;
      const percentage = bin.heights[heightKey];
      const radius = (percentage * 120) / maxPercentage;
      
      const x1 = 150 + radius * Math.sin(angle);
      const y1 = 150 - radius * Math.cos(angle);
      const x2 = 150 + radius * Math.sin(nextAngle);
      const y2 = 150 - radius * Math.cos(nextAngle);
      
      return `M 150,150 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    }).join(' ');

    return <path d={paths} fill={color} opacity={0.9} />;
  };

  const waveHeightColors = [
    { key: 'calm', color: '#E3F2FD', label: '0-0.5 m' },
    { key: 'light', color: '#BBDEFB', label: '0.5-1 m' },
    { key: 'moderate', color: '#90CAF9', label: '1-1.5 m' },
    { key: 'fresh', color: '#64B5F6', label: '1.5-2 m' },
    { key: 'strong', color: '#42A5F5', label: '2-2.5 m' },
    { key: 'high', color: '#2196F3', label: '2.5-3 m' },
    { key: 'veryHigh', color: '#1976D2', label: '3-4 m' },
    { key: 'extreme', color: '#0D47A1', label: '>4 m' }
  ];

  return (
    <div className="card">
        <div className='card-header'>
            <h3 className="card-title">Distribución del oleaje</h3>
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
            <text x="245" y="65" textAnchor="middle" className="rose_points_2">NE</text>
            <text x="245" y="245" textAnchor="middle" className="rose_points_2">SE</text>
            <text x="55" y="245" textAnchor="middle" className="rose_points_2">SW</text>
            <text x="55" y="65" textAnchor="middle" className="rose_points_2">NW</text>
            
            {/* Height category layers - rendering from largest to smallest */}
            {[...waveHeightColors].reverse().map(({key, color}) => (
              <g key={key}>
                {generatePaths(key, color)}
              </g>
            ))}
          </svg>
          
          {/* Legend - keep original order for readability */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            {waveHeightColors.map(({key, color, label}) => (
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

export default WaveRose;