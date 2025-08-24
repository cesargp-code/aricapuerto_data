import React, { useState, useEffect } from 'react';
import { IconMapPin } from '@tabler/icons-react';

const Status = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStatusData();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/status-data', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch status data');
      }
      
      const data = await response.json();
      setStatusData(data);
    } catch (error) {
      console.error('Error fetching status data:', error);
      if (error.name === 'AbortError') {
        setError('Timeout: Unable to load system status');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const MOORED_POSITION = {
    lat: -18.46783,
    lng: -70.34049
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceToMooredPosition = () => {
    if (statusData && statusData.latitude_fixed && statusData.longitude_fixed) {
      const distance = calculateDistance(
        statusData.latitude_fixed,
        statusData.longitude_fixed,
        MOORED_POSITION.lat,
        MOORED_POSITION.lng
      );
      return Math.round(distance);
    }
    return null;
  };

  const isInAlarmRange = () => {
    const distance = getDistanceToMooredPosition();
    return distance !== null && distance > 100;
  };

  const handleOpenMaps = () => {
    if (statusData && statusData.latitude_fixed && statusData.longitude_fixed) {
      const mapsUrl = `https://www.google.com/maps?q=${statusData.latitude_fixed},${statusData.longitude_fixed}(Boya+Oceanográfica+Puerto+Arica)&z=12`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="">
        <div className="row g-3 align-items-center">
          <div className="col-auto">
            <span className="status-indicator status-gray">
              <span className="status-indicator-circle"></span>
              <span className="status-indicator-circle"></span>
              <span className="status-indicator-circle"></span>
            </span>
          </div>
          <div className="col">
            <h2 className="page-title">Sistema</h2>
            <div className="text-secondary">
              <ul className="list-inline list-inline-dots mb-0">
                <li className="list-inline-item">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    Cargando estado...
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="row g-3 align-items-center">
          <div className="col-auto">
            <span className="status-indicator status-red">
              <span className="status-indicator-circle"></span>
              <span className="status-indicator-circle"></span>
              <span className="status-indicator-circle"></span>
            </span>
          </div>
          <div className="col">
            <h2 className="page-title">Sistema</h2>
            <div className="text-secondary">
              <ul className="list-inline list-inline-dots mb-0">
                <li className="list-inline-item">
                  <span className="text-red">Error de conexión</span>
                </li>
                <li className="list-inline-item">
                  <small>{error}</small>
                </li>
              </ul>
            </div>
          </div>
          <div className="">
            <div className="btn-list">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={fetchStatusData}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="row g-3 align-items-top">
        <div className="col-auto">
          <span className={`status-indicator ${isInAlarmRange() ? 'status-red' : 'status-green'} status-indicator-animated`}>
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
                <span className={isInAlarmRange() ? 'text-red' : 'text-green'}>
                  {isInAlarmRange() ? 'Alerta' : 'En rango'}
                </span>
              </li>
              {getDistanceToMooredPosition() !== null && (
                <li className="list-inline-item">
                  Dist. al punto de fondeo: {getDistanceToMooredPosition()} m
                </li>
              )}
            </ul>
          </div>
          {statusData && statusData.latitude_fixed && statusData.longitude_fixed && (
            <div className="text-secondary">
              Coordenadas: {statusData.latitude_fixed}°, {statusData.longitude_fixed}°
            </div>
          )}
          {statusData && statusData.latitude_fixed && statusData.longitude_fixed && (
            <button 
              className="btn btn-primary mt-2"
              onClick={handleOpenMaps}
              title={`${statusData.latitude_fixed}°, ${statusData.longitude_fixed}°`}
            >
              <IconMapPin size={20} />
              <div className="d-flex flex-column align-items-start">
                <span>Ver en Google Maps</span>
              </div>
            </button>
          )}
        </div>
        <div className=""></div>
      </div>
    </div>
  );
};

export default Status;