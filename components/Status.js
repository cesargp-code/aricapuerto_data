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
      const mapsUrl = `https://www.google.com/maps?q=${statusData.latitude_fixed},${statusData.longitude_fixed}`;
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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Estado del Sistema</h3>
      </div>
      <div className="card-body">
        {statusData ? (
          <div>
            <div className="row mb-3">
              <div className="col-sm-6">
                <label className="form-label text-muted">Latitud</label>
                <div className="fw-bold">{statusData.latitude_fixed}°</div>
              </div>
              <div className="col-sm-6">
                <label className="form-label text-muted">Longitud</label>
                <div className="fw-bold">{statusData.longitude_fixed}°</div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleOpenMaps}
              >
                <IconMapPin size={20} />
                Ver en Google Maps
              </button>
            </div>
          </div>
        ) : (
          <div className="text-muted">No hay datos de estado disponibles</div>
        )}
      </div>
    </div>
  );
};

export default Status;