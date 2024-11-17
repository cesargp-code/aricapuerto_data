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
        alert('Check your email for password reset instructions');
        setIsResetMode(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose(); // Close the login form on success
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">{isResetMode ? 'Reset Password' : 'Login'}</h3>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!isResetMode && (
            <div className="mb-3">
              <label className="form-label">Password</label>
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
              {isResetMode ? 'Send Reset Link' : 'Login'}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setIsResetMode(!isResetMode)}
            >
              {isResetMode ? 'Back to Login' : 'Forgot Password?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;