import React, { useState, useEffect } from 'react';
import { IconArrowNarrowUp } from '@tabler/icons-react';

const WaveDirectionStrip = ({ waveData }) => {
  const sampleData = () => {
    if (!waveData || waveData.length === 0) return [];
    if (waveData.length <= 10) return waveData;
    
    const numPoints = 10;
    const samples = [];
    const spacing = (waveData.length - 1) / (numPoints - 1);
    
    for (let i = 0; i < numPoints; i++) {
      const index = Math.round(i * spacing);
      const boundedIndex = Math.min(index, waveData.length - 1);
      samples.push(waveData[boundedIndex]);
    }
    
    return samples;
  };
 
  return (
    <div className="d-flex justify-content-between align-items-center dir_strip">
      {sampleData().map((data, index) => (
        <div key={index} className="text-center d-flex flex-column align-items-center">
          <div style={{ fontSize: 'xx-small' }}>
            {new Date(data.x).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div style={{ 
            transform: `rotate(${data.y + 180}deg)`,
            visibility: (data.y !== null && !isNaN(data.y)) ? 'visible' : 'hidden'
          }}>
            <IconArrowNarrowUp
              size={20} 
              color="#1E40AF"
            />
          </div>
          <div style={{ 
            fontSize: 'xx-small',
            visibility: (data.y !== null && !isNaN(data.y)) ? 'visible' : 'hidden'
          }}>
            {Math.round(data.y)}°
          </div>
        </div>
      ))}
    </div>
  );
};

export default WaveDirectionStrip;