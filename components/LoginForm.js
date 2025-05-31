import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onClose }) => {
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
        alert('Revisa tu correo electrónico para obtener instrucciones para restablecer la contraseña');
        setIsResetMode(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose(); // Close the login form on success
      }
    } catch (error) {
      if (error.message === 'Invalid login credentials') {
        setError('El usuario o la contraseña no son válidos');
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">{isResetMode ? 'Restablecer Contraseña' : 'Iniciar Sesión'}</h3>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center">
            <button type="submit" className="btn btn-primary">
              {isResetMode ? 'Enviar Enlace de Restablecimiento' : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setIsResetMode(!isResetMode)}
            >
              {isResetMode ? 'Volver a Iniciar Sesión' : '¿Olvidaste tu Contraseña?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;