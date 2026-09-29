import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, UploadCloud, History, LogOut, User } from 'lucide-react';
import { authService } from '../services/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Agent';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Scan', path: '/upload', icon: UploadCloud },
    { name: 'Scan History', path: '/history', icon: History },
  ];

  return (
    <div className="flex h-screen bg-cyber-bg text-cyber-text overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-cyber-border glass flex flex-col z-10">
        {/* Brand Logo */}
        <div className="p-6 border-b border-cyber-border flex items-center gap-3">
          <div className="p-2 bg-cyber-accent/10 rounded-lg text-cyber-accent shadow-glow-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-cyber-accent bg-clip-text text-transparent">
              VocalShield
            </h1>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-semibold">
              Deepfake Detector
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyber-accent/15 text-cyber-accent border-l-4 border-cyber-accent shadow-glow-cyan'
                    : 'text-cyber-muted hover:text-white hover:bg-cyber-cardlight/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-accent' : 'text-cyber-muted'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-cyber-border space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-cyber-cardlight border border-cyber-border flex items-center justify-center text-cyber-accent">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{username}</p>
              <p className="text-[10px] text-cyber-success font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-pulse"></span>
                SECURE CONTEXT
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-cyber-muted hover:text-cyber-danger hover:bg-cyber-danger/10 border border-transparent hover:border-cyber-danger/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Glow Ambient background circles */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyber-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-cyber-success/3 rounded-full blur-[140px] pointer-events-none"></div>
        
        {/* Content Body */}
        <div className="flex-1 p-8 z-10 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
