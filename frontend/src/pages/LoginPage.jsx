import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setError('Please fill in all security credentials.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(formData.usernameOrEmail, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative px-4 overflow-hidden font-sans">
      {/* Background glow designs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyber-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-danger/3 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass p-8 rounded-2xl border border-cyber-border/40 relative z-10 shadow-2xl">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyber-accent/10 rounded-xl text-cyber-accent shadow-glow-cyan mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">Access VocalShield</h2>
          <p className="text-xs text-cyber-muted mt-1 uppercase tracking-widest font-semibold">
            SECURE AUDIOMETRIC CONTEXT
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg flex items-center gap-3 text-cyber-danger text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username / Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Identifier
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyber-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                placeholder="Username or Email"
                className="w-full pl-10 pr-4 py-3 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
              Secret Passkey
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
                className="w-full pl-10 pr-4 py-3 bg-cyber-card border border-cyber-border rounded-lg text-sm text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-accent to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg text-sm font-bold tracking-wide shadow-glow-cyan hover:shadow-cyan-400/20 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authorize Terminal'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-cyber-muted font-semibold">
          Don't have clearance?{' '}
          <Link to="/register" className="text-cyber-accent hover:underline">
            Register Credentials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
