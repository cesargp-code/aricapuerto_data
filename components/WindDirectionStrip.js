const WindDirectionStrip = ({ windDirData }) => {
    const sampleData = () => {
      if (!windDirData || windDirData.length === 0) return [];
      if (windDirData.length <= 12) return windDirData;
      
      const samples = [windDirData[0]];
      const step = Math.floor((windDirData.length - 2) / 10);
      
      for (let i = step; i < windDirData.length - 1; i += step) {
        if (samples.length < 11) {
          samples.push(windDirData[i]);
        }
      }
      
      samples.push(windDirData[windDirData.length - 1]);
      return samples;
    };
   
    return (
      <div className="d-flex justify-content-between align-items-center ms-5" style={{ minHeight: '80px' }}>
        {sampleData().map((data, index) => (
          <div key={index} className="text-center d-flex flex-column align-items-center">
            <div style={{ transform: `rotate(${data.y}deg)` }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="#206bc4"
                fill="#206bc4"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 5l0 14" />
                <path d="M16 9l-4 -4" />
                <path d="M8 9l4 -4" />
              </svg>
            </div>
            <div style={{ fontSize: 'xx-small' }}>
              {new Date(data.x).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}<br/>
              {Math.round(data.y)}°
            </div>
          </div>
        ))}
      </div>
    );
   };
   
   export default WindDirectionStrip;