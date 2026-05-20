// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicKey } from '../hooks/usePublicKey';
import { loginWithPassword } from '../utils/api';
import './Auth.css';
import jaipurmetro from "../asset/jaipurmetro.png"

export default function Login() {
  const navigate = useNavigate();
  const { publicKey, loading: keyLoading, error: keyError } = usePublicKey();

  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // if (!publicKey) { setError('Server key unavailable. Please refresh.'); return; }
    if (!form.emailOrPhone || !form.password) { setError('All fields are required.'); return; }

    setLoading(true);
    try {
      const result = await loginWithPassword({ ...form, publicKey });
      // Store token / user info as needed

      const userSession = {
        id: result.id,
        appId: result.AppID,
        sessionToken: result.sessionToken,
        phone: result.phone_number,
        email: result.email,
        fullName: result.full_name,
        gender: result.gender,
        platform: result.platform,
      };

      // store as string
      localStorage.setItem('userSession', JSON.stringify(userSession));

      console.log('Login success:', result);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel – branding */}
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="metro-logo">
            <div className="logo-ring">
              <img
                src={jaipurmetro}
                alt="Jaipur Metro Logo"
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
          <h1 className="brand-name">Jaipur Metro</h1>
          <p className="brand-tagline">Pink City's Urban Pulse</p>
          <div className="brand-dots">
            <span /><span /><span />
          </div>
        </div>
        <div className="brand-decoration" aria-hidden="true">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-panel">
        <div className="auth-card">
          <header className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </header>

          {keyError && (
            <div className="alert alert-warn">
              ⚠ Could not reach server: {keyError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field-group">
              <label htmlFor="emailOrPhone">Email or Phone</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  placeholder="Enter email or phone"
                  value={form.emailOrPhone}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || keyLoading}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Create one</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}



