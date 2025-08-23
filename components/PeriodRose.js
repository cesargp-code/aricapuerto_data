import React, { useMemo } from 'react';

const PeriodRose = ({ data }) => {
  // Process data into direction/period bins
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Initialize direction bins (every 22.5 degrees - 16 directions)
    // Shifted by -11.25 degrees so bins are centered on cardinal directions
    const bins = Array(16).fill(0).map(() => ({
      count: 0,
      periods: {
        veryShort: 0,   // 0-3 s
        short: 0,       // 3-5 s
        moderate: 0,    // 5-7 s
        long: 0,        // 7-9 s
        veryLong: 0,    // 9-11 s
        extreme: 0,     // 11-13 s
        massive: 0,     // 13-15 s
        giant: 0        // >15 s
      }
    }));
    
    // Process each data point
    data.forEach(point => {
      const direction = point.direction;
      const period = point.period;
      
      // Skip if direction or period is null/undefined
      if (direction == null || period == null) return;
      
      // Calculate which bin this direction belongs to
      // Add 360 before modulo to handle negative angles after the -11.25 shift
      const binIndex = Math.floor(((direction + 360 - 11.25) % 360) / 22.5);
      
      bins[binIndex].count++;
      
      // Categorize period
      if (period <= 3) bins[binIndex].periods.veryShort++;
      else if (period <= 5) bins[binIndex].periods.short++;
      else if (period <= 7) bins[binIndex].periods.moderate++;
      else if (period <= 9) bins[binIndex].periods.long++;
      else if (period <= 11) bins[binIndex].periods.veryLong++;
      else if (period <= 13) bins[binIndex].periods.extreme++;
      else if (period <= 15) bins[binIndex].periods.massive++;
      else bins[binIndex].periods.giant++;
    });
    
    // Convert counts to percentages
    const total = data.filter(point => point.direction != null && point.period != null).length;
    if (total === 0) return null;
    
    return bins.map(bin => ({
      ...bin,
      percentage: (bin.count / total) * 100,
      periods: {
        veryShort: (bin.periods.veryShort / total) * 100,
        short: (bin.periods.short / total) * 100,
        moderate: (bin.periods.moderate / total) * 100,
        long: (bin.periods.long / total) * 100,
        veryLong: (bin.periods.veryLong / total) * 100,
        extreme: (bin.periods.extreme / total) * 100,
        massive: (bin.periods.massive / total) * 100,
        giant: (bin.periods.giant / total) * 100
      }
    }));
  }, [data]);

  // Early return if no data
  if (!processedData) return <div>No data available</div>;

  // Calculate maximum percentage for scaling
  const maxPercentage = Math.max(...processedData.map(bin => bin.percentage));
  
  // Generate the SVG paths for each period category
  const generatePaths = (periodKey, color) => {
    const paths = processedData.map((bin, index) => {
      const angle = ((index * 22.5 - 11.25) * Math.PI) / 180;
      const nextAngle = (((index + 1) * 22.5 - 11.25) * Math.PI) / 180;
      const percentage = bin.periods[periodKey];
      const radius = (percentage * 120) / maxPercentage;
      
      const x1 = 150 + radius * Math.sin(angle);
      const y1 = 150 - radius * Math.cos(angle);
      const x2 = 150 + radius * Math.sin(nextAngle);
      const y2 = 150 - radius * Math.cos(nextAngle);
      
      return `M 150,150 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    }).join(' ');

    return <path d={paths} fill={color} opacity={0.9} />;
  };

  const periodColors = [
    { key: 'veryShort', color: '#E0F7FA', label: '0-3 s' },
    { key: 'short', color: '#B2EBF2', label: '3-5 s' },
    { key: 'moderate', color: '#80DEEA', label: '5-7 s' },
    { key: 'long', color: '#4DD0E1', label: '7-9 s' },
    { key: 'veryLong', color: '#26C6DA', label: '9-11 s' },
    { key: 'extreme', color: '#20c997', label: '11-13 s' },
    { key: 'massive', color: '#1db388', label: '13-15 s' },
    { key: 'giant', color: '#1AA67D', label: '>15 s' }
  ];

  return (
    <div className="card">
        <div className='card-header'>
            <h3 className="card-title">Distribución de periodo de ola</h3>
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
            
            {/* Period category layers - rendering from largest to smallest */}
            {[...periodColors].reverse().map(({key, color}) => (
              <g key={key}>
                {generatePaths(key, color)}
              </g>
            ))}
          </svg>
          
          {/* Legend - keep original order for readability */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            {periodColors.map(({key, color, label}) => (
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

export default PeriodRose;