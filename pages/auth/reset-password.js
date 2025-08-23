import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { updatePassword } = useAuth();

  useEffect(() => {
    // Check if we have the recovery token in the URL
    const { access_token, refresh_token, type } = router.query;
    
    if (type !== 'recovery' || !access_token) {
      setError('Enlace de recuperación inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.');
    }
  }, [router.query]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page page-center">
        <div className="container-tight py-4">
          <div className="card card-md">
            <div className="card-body text-center">
              <div className="mb-4">
                <h2 className="h1 text-green">¡Contraseña actualizada!</h2>
              </div>
              <p className="text-muted">
                Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio en unos segundos...
              </p>
              <div className="mt-4">
                <Link href="/" className="btn btn-primary">
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-center">
      <div className="container-tight py-4">
        <div className="card card-md">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Restablecer contraseña</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {router.query.type === 'recovery' && router.query.access_token ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <div className="form-hint">
                    Debe tener al menos 6 caracteres
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Confirmar contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-footer">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-muted mb-4">
                  Este enlace de recuperación no es válido o ha expirado.
                </p>
                <Link href="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center text-muted mt-3">
          <Link href="/" className="text-muted">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;