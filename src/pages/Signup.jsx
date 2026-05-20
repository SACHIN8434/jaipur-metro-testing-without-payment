// pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicKey } from '../hooks/usePublicKey';
import { sendSignUpOtp, verifyOtp, completeSignup } from '../utils/api';
import './Auth.css';
import jaipurmetro from "../asset/jaipurmetro.png"


/* ─── Step indicator ──────────────────────────────────────────────────── */
function StepBar({ current }) {
  const steps = ['Phone', 'OTP', 'Details'];
  return (
    <div className="step-bar" aria-label="Registration steps">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`step-item ${i <= current ? 'active' : ''} ${i < current ? 'done' : ''}`}>
            <div className="step-bubble">
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="step-label">{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Step 1: Phone number ────────────────────────────────────────────── */
function StepPhone({ onNext, publicKey }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone) { setError('Phone number is required.'); return; }

    setLoading(true);
    try {
      await sendSignUpOtp({ identifier: phone});
      onNext(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="step-intro">
        <h3>Enter your phone number</h3>
        <p>We'll send a one-time password to verify it.</p>
      </div>

      <div className="field-group">
        <label htmlFor="phone">Phone Number</label>
        <div className="input-wrap">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.93 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.91 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Send OTP'}
      </button>
    </form>
  );
}

/* ─── Step 2: OTP verification ───────────────────────────────────────── */
function StepOtp({ phone, onNext, onBack, publicKey }) {
  const [otp, setOtp] = useState(['', '', '', '']); // ← 4 digits
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) { // ← max index 3 for 4-digit OTP
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4); // ← 4
    if (pasted) {
      setOtp(pasted.split('').concat(Array(4 - pasted.length).fill(''))); // ← 4
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length < 4) { setError('Enter the complete 4-digit OTP.'); return; } // ← 4

    setLoading(true);
    try {
      await verifyOtp({ identifier: phone, otp: otpString, publicKey });
      onNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="step-intro">
        <h3>Verify OTP</h3>
        <p>Enter the 4-digit code sent to <strong>{phone}</strong></p> {/* ← 4-digit */}
      </div>

      <div className="otp-row" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            className="otp-box"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Verify OTP'}
      </button>

      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Change Number
      </button>
    </form>
  );
}

/* ─── Step 3: User details ───────────────────────────────────────────── */
function StepDetails({ phone, publicKey, onDone }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await completeSignup({
        phone,
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        os: 'web',
        publicKey,
      });
      console.log('Signup success:', result);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="step-intro">
        <h3>Almost there!</h3>
        <p>Set up your profile to complete registration.</p>
      </div>

      {/* Full Name */}
      <div className="field-group">
        <label htmlFor="fullName">Full Name</label>
        <div className="input-wrap">
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your full name"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="field-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <input
            id="password"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="toggle-pass"
            onClick={() => setShowPass((v) => !v)}
          >
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="field-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-wrap">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPass ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Create Account'}
      </button>
    </form>
  );
}

/* ─── Root Signup page ───────────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();
  const { publicKey, loading: keyLoading, error: keyError } = usePublicKey();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');

  const handlePhoneDone = (ph) => { setPhone(ph); setStep(1); };
  const handleOtpDone = () => setStep(2);
  const handleDone = () => navigate('/login', { state: { registered: true } });

  return (
    <div className="auth-root">
      {/* Branding */}
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white/60 bg-white/15 backdrop-blur-md flex items-center justify-center shadow-[0_0_0_12px_rgba(255,255,255,0.08)]">
              <img
                src={jaipurmetro}
                alt="Jaipur Metro Logo"
                className="w-16 h-16 object-contain"
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

      {/* Form panel */}
      <div className="auth-panel">
        <div className="auth-card">
          <header className="auth-header">
            <h2>Create Account</h2>
            <p>Join Jaipur Metro today</p>
          </header>

          {keyError && (
            <div className="alert alert-warn">⚠ Server unreachable: {keyError}</div>
          )}

          <StepBar current={step} />

          {step === 0 && (
            <StepPhone onNext={handlePhoneDone} publicKey={publicKey} />
          )}
          {step === 1 && (
            <StepOtp
              phone={phone}
              onNext={handleOtpDone}
              onBack={() => setStep(0)}
              publicKey={publicKey}
            />
          )}
          {step === 2 && (
            <StepDetails phone={phone} publicKey={publicKey} onDone={handleDone} />
          )}

          <footer className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}