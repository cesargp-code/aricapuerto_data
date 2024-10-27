import React, { useState, useEffect } from 'react';
import { IconArrowRight } from '@tabler/icons-react';

const SecondaryDataHome = () => {
  const [data, setData] = useState({
    ATMS: '-',
    DRYT: '-',
    DEWT: '-',
    created_at: new Date()
  });
  const [lastUpdated, setLastUpdated] = useState('-');

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
      setLastUpdated(new Date(newData.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }));
    } catch (error) {
      console.error('Error fetching secondary data:', error);
    }
  };

  return (
    <div className="col-12">
      <div className="row row-cards">
        <div className="col-sm-6">
          <div className="card card-sm">
            <div className="card-header border-bottom-0">
              <div>
                <h3 className='card-title'>Presión atmosférica (hPa)</h3>
                <p className="card-subtitle main_card_value_last_updated">actualizado {lastUpdated}</p>
              </div>
              <div className='card-actions d-flex align-items-center'>
                <span className="status main_card_value">
                  <span className='status-dot status-dot-animated'></span>
                  {data.ATMS} hPa
                </span>
                <IconArrowRight
                  stroke={2}
                  size={24} 
                  className="text-orange ms-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="card card-sm">
            <div className="card-header border-bottom-0">
              <div>
                <h3 className='card-title'>Temperatura (ºC)</h3>
                <p className="card-subtitle main_card_value_last_updated">actualizado {lastUpdated}</p>
              </div>
              <div className='card-actions d-flex align-items-center'>
                <span className="status main_card_value">
                  <span className='status-dot status-dot-animated'></span>
                  {data.DRYT} ºC
                </span>
                <IconArrowRight
                  stroke={2}
                  size={24} 
                  className="text-orange ms-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="card card-sm">
            <div className="card-header border-bottom-0">
              <div>
                <h3 className='card-title'>Punto de rocío (ºC)</h3>
                <p className="card-subtitle main_card_value_last_updated">actualizado {lastUpdated}</p>
              </div>
              <div className='card-actions d-flex align-items-center'>
                <span className="status main_card_value">
                  <span className='status-dot status-dot-animated'></span>
                  {data.DEWT} ºC
                </span>
                <IconArrowRight
                  stroke={2}
                  size={24} 
                  className="text-orange ms-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryDataHome;