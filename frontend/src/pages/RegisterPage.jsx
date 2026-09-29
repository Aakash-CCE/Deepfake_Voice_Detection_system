import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all security fields.');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData.username, formData.email, formData.password);
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative px-4 overflow-hidden font-sans">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyber-success/3 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass p-8 rounded-2xl border border-cyber-border/40 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyber-accent/10 rounded-xl text-cyber-accent shadow-glow-cyan mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">Register Terminal</h2>
          <p className="text-xs text-cyber-muted mt-1 uppercase tracking-widest font-semibold">
            ESTABLISH SYMMETRIC CLEARANCE
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg flex items-center gap-3 text-cyber-danger text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-cyber-success/10 border border-cyber-success/30 rounded-lg flex items-center gap-3 text-cyber-success text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Registration successful! Redirecting to credentials portal...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Codename (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyber-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Agent007"
                disabled={success}
                className="w-full pl-10 pr-4 py-2.5 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Secure Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyber-muted">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="agent@vocalshield.net"
                disabled={success}
                className="w-full pl-10 pr-4 py-2.5 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Security Passkey
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyber-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={success}
                className="w-full pl-10 pr-4 py-2.5 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Verify Passkey
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyber-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={success}
                className="w-full pl-10 pr-4 py-2.5 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 mt-2 bg-gradient-to-r from-cyber-accent to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg text-sm font-bold tracking-wide shadow-glow-cyan hover:shadow-cyan-400/20 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              'Register Clearance'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-cyber-muted font-semibold">
          Already have clearance?{' '}
          <Link to="/login" className="text-cyber-accent hover:underline">
            Terminal Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
