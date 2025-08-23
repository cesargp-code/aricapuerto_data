import React, { useState, useEffect } from 'react';
import { IconMapPin } from '@tabler/icons-react';

const Status = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/status-data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch status data');
      }
      
      const data = await response.json();
      setStatusData(data);
    } catch (error) {
      console.error('Error fetching status data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (statusData && statusData.latitude_fixed && statusData.longitude_fixed) {
      const mapsUrl = `https://www.google.com/maps?q=${statusData.latitude_fixed},${statusData.longitude_fixed}(Boya+Oceanográfica+Puerto+Arica)&z=10`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando estado del sistema...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger">
        <div className="card-body">
          <div className="text-danger">
            Error al cargar el estado: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="row g-3 align-items-center">
        <div className="col-auto">
          <span className="status-indicator status-green status-indicator-animated">
            <span className="status-indicator-circle"></span>
            <span className="status-indicator-circle"></span>
            <span className="status-indicator-circle"></span>
          </span>
        </div>
        <div className="col">
          <h2 className="page-title">Posición</h2>
          <div className="text-secondary">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                <span className="text-green">Operativa</span>
              </li>
              {statusData && statusData.latitude_fixed && statusData.longitude_fixed && (
                <li className="list-inline-item">
                  {statusData.latitude_fixed}°, {statusData.longitude_fixed}°
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="">
          <div className="btn-list">
            {statusData && statusData.latitude_fixed && statusData.longitude_fixed && (
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleOpenMaps}
              >
                <IconMapPin size={20} />
                Ver en Google Maps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;