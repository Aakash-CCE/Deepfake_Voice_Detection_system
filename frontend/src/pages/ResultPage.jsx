import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Play, ArrowLeft, Info, HelpCircle } from 'lucide-react';

const ResultPage = () => {
  const location = useLocation();
  const { result, filename } = location.state || {};

  // Safeguard: Redirect if accessed without prediction state
  if (!result) {
    return <Navigate to="/upload" replace />;
  }

  const isFake = result.prediction === "AI Generated Voice";
  
  // Custom colors and icons based on decision
  const config = isFake 
    ? {
        title: "Synthetic Identity Detected",
        colorClass: "text-cyber-danger",
        borderClass: "border-cyber-danger/30",
        bgClass: "bg-cyber-danger/5",
        shadowClass: "shadow-glow-red",
        icon: ShieldAlert,
        badgeText: "DEEPFAKE THREAT",
        badgeColor: "bg-cyber-danger/25 text-cyber-danger border-cyber-danger/30"
      }
    : {
        title: "Organic Voice Authenticated",
        colorClass: "text-cyber-success",
        borderClass: "border-cyber-success/30",
        bgClass: "bg-cyber-success/5",
        shadowClass: "shadow-glow-green",
        icon: ShieldCheck,
        badgeText: "VERIFIED HUMAN",
        badgeColor: "bg-cyber-success/25 text-cyber-success border-cyber-success/30"
      };

  const Icon = config.icon;
  const metrics = result.metrics || {};

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyber-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Scanner
        </Link>
      </div>

      {/* Main Diagnostic Header Card */}
      <div className={`glass p-8 rounded-xl border ${config.borderClass} ${config.shadowClass} relative overflow-hidden`}>
        {/* Glow backdrop indicator */}
        <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l opacity-20 pointer-events-none ${isFake ? 'from-cyber-danger/30' : 'from-cyber-success/30'}`}></div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Large Icon Indicator */}
          <div className={`p-5 rounded-2xl ${isFake ? 'bg-cyber-danger/10 text-cyber-danger' : 'bg-cyber-success/10 text-cyber-success'} border border-current/25`}>
            <Icon className="w-16 h-16" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded border tracking-widest ${config.badgeColor}`}>
              {config.badgeText}
            </span>
            <h2 className="text-2xl font-bold tracking-wide">{config.title}</h2>
            <p className="text-xs text-cyber-muted font-mono">
              FILE SCAN: <span className="text-white font-sans">{filename}</span>
            </p>
          </div>

          {/* Radial Confidence Score */}
          <div className="flex flex-col items-center justify-center p-4 glass rounded-xl border border-cyber-border min-w-36">
            <span className="text-3xl font-extrabold tracking-tight">{result.confidence}%</span>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold mt-1">
              Confidence
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-2 ${
              result.risk_level === 'HIGH' ? 'bg-cyber-danger/20 text-cyber-danger' :
              result.risk_level === 'MEDIUM' ? 'bg-cyber-warning/20 text-cyber-warning' :
              'bg-cyber-success/20 text-cyber-success'
            }`}>
              {result.risk_level} RISK
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Deep Analysis & Explanations */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-cyber-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyber-accent">
              Vulnerability Analysis
            </h3>
            
            <div className="space-y-4">
              {result.analysis && result.analysis.length > 0 ? (
                result.analysis.map((point, index) => (
                  <div key={index} className="flex gap-3 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isFake ? 'bg-cyber-danger' : 'bg-cyber-success'}`}></div>
                    <p className="text-cyber-text leading-relaxed">{point}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-cyber-muted">No anomalous patterns identified in the audio spectrum.</p>
              )}
            </div>
          </div>

          <div className="glass p-6 rounded-xl border border-cyber-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyber-muted">
              <Info className="w-4 h-4 text-cyber-accent" /> Did you know?
            </h4>
            <p className="text-[11px] text-cyber-muted leading-relaxed">
              AI voices are often synthesized using vocoders which model spectral frequencies cleanly but fail to replicate micro-deviations in the human throat. Jitter (pitch stability) and shimmer (volume stability) are excellent organic markers.
            </p>
          </div>
        </div>

        {/* Acoustic Metrics Grid */}
        <div className="md:col-span-3 glass p-6 rounded-xl border border-cyber-border space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyber-accent flex items-center gap-2">
            Acoustic Diagnostics Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric Card: Jitter */}
            <div className="p-4 bg-cyber-card border border-cyber-border/40 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-cyber-muted font-bold uppercase tracking-wide">Jitter (Local)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-cardlight border border-cyber-border text-cyber-muted">F0 Pitch Variation</span>
                </div>
                <p className="text-xl font-bold mt-2">{((metrics.jitter || 0) * 100).toFixed(3)}%</p>
              </div>
              <p className="text-[10px] text-cyber-muted mt-2 border-t border-cyber-border/30 pt-2 leading-relaxed">
                Organic voice: 0.20% to 1.5%. Flat/robotic voice: &lt; 0.10% (too perfect) or very high (noisy).
              </p>
            </div>

            {/* Metric Card: Shimmer */}
            <div className="p-4 bg-cyber-card border border-cyber-border/40 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-cyber-muted font-bold uppercase tracking-wide">Shimmer (Local)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-cardlight border border-cyber-border text-cyber-muted">Amp Variation</span>
                </div>
                <p className="text-xl font-bold mt-2">{((metrics.shimmer || 0) * 100).toFixed(3)}%</p>
              </div>
              <p className="text-[10px] text-cyber-muted mt-2 border-t border-cyber-border/30 pt-2 leading-relaxed">
                Organic voice: 1.0% to 4.0%. Text-To-Speech renders typically display extremely low volume deviation.
              </p>
            </div>

            {/* Metric Card: Pitch Standard Deviation */}
            <div className="p-4 bg-cyber-card border border-cyber-border/40 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-cyber-muted font-bold uppercase tracking-wide">Pitch Deviation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-cardlight border border-cyber-border text-cyber-muted">Intonation</span>
                </div>
                <p className="text-xl font-bold mt-2">{(metrics.pitch_std || 0).toFixed(1)} Hz</p>
              </div>
              <p className="text-[10px] text-cyber-muted mt-2 border-t border-cyber-border/30 pt-2 leading-relaxed">
                Organic speech has active intonations (std &gt; 10Hz). Robotic speech is monotone (&lt; 5Hz).
              </p>
            </div>

            {/* Metric Card: Spectral Centroid */}
            <div className="p-4 bg-cyber-card border border-cyber-border/40 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-cyber-muted font-bold uppercase tracking-wide">Spectral Centroid</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-cardlight border border-cyber-border text-cyber-muted">Barycenter</span>
                </div>
                <p className="text-xl font-bold mt-2">{(metrics.spec_centroid || 0).toFixed(0)} Hz</p>
              </div>
              <p className="text-[10px] text-cyber-muted mt-2 border-t border-cyber-border/30 pt-2 leading-relaxed">
                Center of gravity of the spectrum. Neural models often produce high frequency vocoder noise (peaks &gt; 2500Hz).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
