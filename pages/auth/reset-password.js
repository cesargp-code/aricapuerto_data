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
  const [isValidRecovery, setIsValidRecovery] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { updatePassword, user } = useAuth();

  useEffect(() => {
    // Check if we arrived here from a password recovery flow
    const checkRecoveryFlow = async () => {
      // Clear any previous errors
      setError('');
      
      // Check URL hash first (where Supabase puts recovery tokens)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        // We have recovery tokens in the URL, this is a valid recovery
        setIsValidRecovery(true);
        setIsChecking(false);
        return;
      }
      
      // If no hash params, wait for auth to settle and check if user is authenticated
      const timeout = setTimeout(() => {
        if (user && user.aud === 'authenticated') {
          // User is authenticated, allow password reset
          // (This handles cases where tokens were already processed)
          setIsValidRecovery(true);
        } else {
          setError('Enlace de recuperación inválido o expirado. Por favor, solicite un nuevo enlace de recuperación.');
          setIsValidRecovery(false);
        }
        setIsChecking(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    };
    
    checkRecoveryFlow();
  }, [user]);

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
                <h2 className="h1 text-green">Contraseña actualizada</h2>
              </div>
              <p className="text-muted">
                Su contraseña se ha actualizado. Será redirigido al inicio en unos segundos...
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
    <div className="page">
      {/* Header */}
      <header className="navbar navbar-expand-md navbar-dark bg-primary text-dark d-print-none">
        <div className="container-xl position-relative">
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 mb-0">
            <div className="h2 mb-0 text-decoration-none d-flex align-items-center">
              <img id="logo" src="/img/logo-inverted.svg" alt="Logo" />
            </div>
          </h1>
        </div>
      </header>

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

            {isValidRecovery ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Ingrese su nueva contraseña"
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
                    placeholder="Confirme su nueva contraseña"
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
            ) : isValidRecovery === false ? (
              <div className="text-center">
                <Link href="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
              </div>
            ) : isChecking ? (
              <div className="text-center">
                <p className="text-muted mb-4">
                  Verificando enlace de recuperación...
                </p>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted mb-4">
                  No se pudo verificar el enlace de recuperación.
                </p>
                <Link href="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default ResetPassword;