import React, { useState, useEffect } from 'react';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import Link from 'next/link';

const SecondaryDataHome = () => {
  const [data, setData] = useState({
    ATMS: '-',
    DRYT: '-',
    DEWT: '-',
    created_at: new Date()
  });
  const [lastUpdated, setLastUpdated] = useState('-');
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/secondary-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const newData = await response.json();
      setData(newData);

      // Check if data is stale (more than 30 minutes old)
      const dataTime = new Date(newData.created_at);
      const now = new Date();
      const timeDiff = now - dataTime;
      const isDataStale = timeDiff > 30 * 60 * 1000; // 30 minutes in milliseconds
      setIsStale(isDataStale);

      setLastUpdated(new Date(newData.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }));
    } catch (error) {
      console.error('Error fetching secondary data:', error);
      setIsStale(true);
    }
  };

  return (
    <div className="col-12 secondary-measure">
      <div className="row row-cards">
      <div className="col-sm-6">
        <Link href="/pressure" className="text-decoration-none">
          <div className="card card-sm">
            <div className="card-header border-bottom-0">
              <div>
                <h3 className='card-title'>Presión atmosférica</h3>
                <p className={`card-subtitle ${isStale ? 'status status-red' : ''}`} 
                  style={{ 
                    fontSize: "x-small",
                    ...(isStale && { 
                      height: "18px",
                      padding: "0 5px"
                    })
                  }}>
                  {isStale && <span className="status-dot status-dot-animated"></span>}
                  actualizado {lastUpdated}
                </p>
              </div>
              <div className='card-actions'>
                <span className="status status-purple current-pill">
                  <span className={`status-dot ${!isStale ? 'status-dot-animated' : ''}`}
                        style={isStale ? { backgroundColor: '#909090' } : {}}>
                  </span>
                  {data.ATMS} hPa
                </span>
                <IconCircleArrowRightFilled
                  size={40}
                  className="navigation_arrow"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>

        <div className="col-sm-6">
          <Link href="/temperature" className="text-decoration-none">
            <div className="card card-sm">
              <div className="card-header border-bottom-0">
                <div>
                  <h3 className='card-title'>Temperatura</h3>
                  <p className={`card-subtitle ${isStale ? 'status status-red' : ''}`} 
                     style={{ 
                       fontSize: "x-small",
                       ...(isStale && { 
                         height: "18px",
                         padding: "0 5px"
                       })
                     }}>
                    {isStale && <span className="status-dot status-dot-animated"></span>}
                    actualizado {lastUpdated}
                  </p>
                </div>
                <div className='card-actions'>
                  <span className="status status-purple current-pill">
                    <span className={`status-dot ${!isStale ? 'status-dot-animated' : ''}`}
                          style={isStale ? { backgroundColor: '#909090' } : {}}>
                    </span>
                    {data.DRYT} ºC
                  </span>
                  <IconCircleArrowRightFilled
                    size={40} 
                    className="navigation_arrow"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecondaryDataHome;