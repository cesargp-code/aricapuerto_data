import React, { useState, useEffect } from 'react';
import { IconArrowUpCircle } from '@tabler/icons-react';

const WindDirectionStrip = ({ windDirData }) => {
  const sampleData = () => {
    if (!windDirData || windDirData.length === 0) return [];
    if (windDirData.length <= 10) return windDirData;
    
    // We want 10 points total (first, last, and 8 in between)
    const numPoints = 10;
    const samples = [];
    
    // Calculate the spacing between points
    const spacing = (windDirData.length - 1) / (numPoints - 1);
    
    // Generate evenly spaced indices
    for (let i = 0; i < numPoints; i++) {
      const index = Math.round(i * spacing);
      // Ensure we don't exceed array bounds
      const boundedIndex = Math.min(index, windDirData.length - 1);
      samples.push(windDirData[boundedIndex]);
    }
    
    return samples;
  };
 
  return (
    <div className="d-flex justify-content-between align-items-center ms-4 dir_strip">
      {sampleData().map((data, index) => (
        <div key={index} className="text-center d-flex flex-column align-items-center">
          <div style={{ fontSize: 'xx-small' }}>
            {new Date(data.x).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div style={{ transform: `rotate(${data.y}deg)` }}>
          <IconArrowUpCircle
            size={20} 
            color="#157B37"
          />
          </div>
          <div style={{ fontSize: 'xx-small' }}>
            {Math.round(data.y)}°
          </div>
        </div>
      ))}
    </div>
  );
};

export default WindDirectionStrip;