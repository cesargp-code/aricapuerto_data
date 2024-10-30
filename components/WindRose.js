import React, { useMemo } from 'react';

const WindRose = ({ data }) => {
  // Process data into direction/speed bins
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Initialize direction bins (every 22.5 degrees - 16 directions)
    const bins = Array(16).fill(0).map(() => ({
      count: 0,
      speeds: {
        light: 0,    // 0-5 m/s
        moderate: 0,  // 5-10 m/s
        strong: 0,    // 10-15 m/s
        extreme: 0    // >15 m/s
      }
    }));
    
    // Process each data point
    data.forEach(point => {
      const direction = point.direction;
      const speed = point.y;
      
      // Calculate which bin this direction belongs to
      const binIndex = Math.floor(((direction + 11.25) % 360) / 22.5);
      
      bins[binIndex].count++;
      
      // Categorize speed
      if (speed <= 5) bins[binIndex].speeds.light++;
      else if (speed <= 10) bins[binIndex].speeds.moderate++;
      else if (speed <= 15) bins[binIndex].speeds.strong++;
      else bins[binIndex].speeds.extreme++;
    });
    
    // Convert counts to percentages
    const total = data.length;
    return bins.map(bin => ({
      ...bin,
      percentage: (bin.count / total) * 100,
      speeds: {
        light: (bin.speeds.light / total) * 100,
        moderate: (bin.speeds.moderate / total) * 100,
        strong: (bin.speeds.strong / total) * 100,
        extreme: (bin.speeds.extreme / total) * 100
      }
    }));
  }, [data]);

  // Early return if no data
  if (!processedData) return <div>No data available</div>;

  // Calculate maximum percentage for scaling
  const maxPercentage = Math.max(...processedData.map(bin => bin.percentage));
  
  // Generate the SVG paths for each speed category
  const generatePaths = (speedKey, color, scale = 1) => {
    const paths = processedData.map((bin, index) => {
      const angle = (index * 22.5 * Math.PI) / 180;
      const nextAngle = ((index + 1) * 22.5 * Math.PI) / 180;
      const percentage = bin.speeds[speedKey];
      const radius = (percentage * 120) / maxPercentage; // Scale to 120px max radius
      
      const x1 = 150 + radius * Math.sin(angle);
      const y1 = 150 - radius * Math.cos(angle);
      const x2 = 150 + radius * Math.sin(nextAngle);
      const y2 = 150 - radius * Math.cos(nextAngle);
      
      return `M 150,150 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    }).join(' ');

    return <path d={paths} fill={color} opacity={0.7} />;
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">Distribución del viento</h3>
        <div className="d-flex justify-content-center align-items-center">
          <svg viewBox="0 0 300 300" className="w-full max-w-md">
            {/* Render concentric circles for reference */}
            {[25, 50, 75, 100].map((radius, i) => (
              <circle
                key={i}
                cx="150"
                cy="150"
                r={radius * 1.2}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Direction labels */}
            <text x="150" y="30" textAnchor="middle">N</text>
            <text x="270" y="150" textAnchor="start">E</text>
            <text x="150" y="280" textAnchor="middle">S</text>
            <text x="30" y="150" textAnchor="end">W</text>
            
            {/* Speed category layers */}
            {generatePaths('extreme', '#ef4444')}  {/* Red */}
            {generatePaths('strong', '#f97316')}   {/* Orange */}
            {generatePaths('moderate', '#84cc16')} {/* Green */}
            {generatePaths('light', '#22c55e')}    {/* Light green */}
          </svg>
          
          {/* Legend */}
          <div className="ms-4 text-sm">
            <div className="mb-2">
              <span className="inline-block w-3 h-3 bg-[#22c55e] mr-2"></span>
              0-5 m/s
            </div>
            <div className="mb-2">
              <span className="inline-block w-3 h-3 bg-[#84cc16] mr-2"></span>
              5-10 m/s
            </div>
            <div className="mb-2">
              <span className="inline-block w-3 h-3 bg-[#f97316] mr-2"></span>
              10-15 m/s
            </div>
            <div className="mb-2">
              <span className="inline-block w-3 h-3 bg-[#ef4444] mr-2"></span>
              &gt;15 m/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindRose;