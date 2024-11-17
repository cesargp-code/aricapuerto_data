import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const { signIn, forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isResetMode) {
        const { error } = await forgotPassword(email);
        if (error) throw error;
        alert('Check your email for password reset instructions');
        setIsResetMode(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose(); // Close the modal on success
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-blur fade show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isResetMode ? 'Recuperar contraseña' : 'Iniciar sesión'}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {!isResetMode && (
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="form-footer">
                  <button type="submit" className="btn btn-primary w-100">
                    {isResetMode ? 'Enviar instrucciones' : 'Iniciar sesión'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-link link-secondary"
                onClick={() => setIsResetMode(!isResetMode)}
              >
                {isResetMode ? 'Volver al login' : '¿Olvidaste tu contraseña?'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default LoginModal;