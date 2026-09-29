import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scanService } from '../services/api';
import { 
  ShieldCheck, ShieldAlert, Activity, Award, 
  ArrowUpRight, UploadCloud, Loader2, AlertTriangle 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await scanService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Could not retrieve dashboard statistics. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-40">
        <Loader2 className="w-12 h-12 text-cyber-accent animate-spin mb-4" />
        <p className="text-sm text-cyber-muted font-semibold tracking-wide animate-pulse">
          Syncing Security Command Center...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-cyber-danger/10 border border-cyber-danger/30 rounded-xl flex items-center gap-4 text-cyber-danger">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">System Sync Error</h4>
          <p className="text-xs text-cyber-muted mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Doughnut Chart: Risk Level Distribution
  const riskLabels = ['LOW RISK', 'MEDIUM RISK', 'HIGH RISK'];
  const riskData = [
    stats.risk_distribution?.LOW || 0,
    stats.risk_distribution?.MEDIUM || 0,
    stats.risk_distribution?.HIGH || 0,
  ];

  const doughnutData = {
    labels: riskLabels,
    datasets: [
      {
        data: riskData,
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)',  // Cyber Green
          'rgba(245, 158, 11, 0.75)',  // Amber Warning
          'rgba(239, 68, 68, 0.75)',   // Threat Red
        ],
        borderColor: [
          '#10b981', '#f59e0b', '#ef4444'
        ],
        borderWidth: 1.5,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 10, weight: 'bold' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#f8fafc',
        borderColor: '#1e293b',
        borderWidth: 1,
      },
    },
    cutout: '65%',
  };

  // 2. Line Chart: Confidence Trends (Chronological)
  const chronologicalScans = [...(stats.recent_activity || [])].reverse();
  const lineLabels = chronologicalScans.map((s, idx) => `Scan ${idx + 1}`);
  const lineDataPoints = chronologicalScans.map((s) => s.confidence);
  
  const lineData = {
    labels: lineLabels.length > 0 ? lineLabels : ['No Data'],
    datasets: [
      {
        label: 'Scan Confidence (%)',
        data: lineDataPoints.length > 0 ? lineDataPoints : [0],
        fill: true,
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#f8fafc',
        borderColor: '#1e293b',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { size: 9 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { size: 9 } },
      },
    },
  };

  // 3. Bar Chart: Jitter & Shimmer Averaging comparison
  // (Simple comparative visualization for reference parameters)
  const barData = {
    labels: ['Real Voice Avg', 'Deepfake Avg'],
    datasets: [
      {
        label: 'Acoustic Jitter (x100 %)',
        data: [0.55, 0.04], // Typical baseline reference values
        backgroundColor: 'rgba(56, 189, 248, 0.7)',
        borderColor: '#38bdf8',
        borderWidth: 1,
      },
      {
        label: 'Acoustic Shimmer (x100 %)',
        data: [2.10, 0.08], // Typical baseline reference values
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 9 } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#94a3b8', font: { size: 9 } } }
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Command Center</h1>
          <p className="text-sm text-cyber-muted">Vocal identity integrity scan telemetry and alert diagnostics.</p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 px-5 py-2.5 bg-cyber-accent text-cyber-card font-bold rounded-lg text-xs shadow-glow-cyan hover:shadow-sky-400/30 transition-all hover:bg-sky-300 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          Deploy New Scan
        </Link>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scans */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold">Total Scans</span>
            <p className="text-3xl font-extrabold mt-1 tracking-tight">{stats.total_scans}</p>
          </div>
          <div className="p-3 bg-cyber-accent/10 border border-cyber-accent/20 rounded-lg text-cyber-accent">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Fake Detected */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold">Deepfakes Blocked</span>
            <p className="text-3xl font-extrabold mt-1 tracking-tight text-cyber-danger">{stats.fake_detected}</p>
          </div>
          <div className="p-3 bg-cyber-danger/10 border border-cyber-danger/20 rounded-lg text-cyber-danger">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Real Detected */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold">Authentic Voices</span>
            <p className="text-3xl font-extrabold mt-1 tracking-tight text-cyber-success">{stats.real_detected}</p>
          </div>
          <div className="p-3 bg-cyber-success/10 border border-cyber-success/20 rounded-lg text-cyber-success">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold">Avg Accuracy</span>
            <p className="text-3xl font-extrabold mt-1 tracking-tight">{stats.avg_confidence}%</p>
          </div>
          <div className="p-3 bg-cyber-warning/10 border border-cyber-warning/20 rounded-lg text-cyber-warning">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Line Chart: Confidence History */}
        <div className="glass p-5 rounded-xl border border-cyber-border md:col-span-2 flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-accent">Inference Confidence Chronology</h3>
            <span className="text-[10px] text-cyber-muted font-mono">Last 10 Scans</span>
          </div>
          <div className="flex-1 min-h-[220px] relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Doughnut: Risk Profile */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex flex-col justify-between min-h-[300px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-accent mb-4">Threat Risk Profile</h3>
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Third row: Jitter comparison bar + Recent Scans list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric reference comparative Bar */}
        <div className="glass p-5 rounded-xl border border-cyber-border flex flex-col justify-between min-h-[300px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-accent mb-4">Micro-Stability Diagnostics Benchmark</h3>
          <div className="flex-1 min-h-[200px] relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Recent scan table */}
        <div className="glass p-5 rounded-xl border border-cyber-border lg:col-span-2 flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-accent">Recent Threat Detections</h3>
            <Link to="/history" className="text-[10px] text-cyber-accent hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wide">
              Full Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyber-border text-cyber-muted font-bold uppercase">
                    <th className="pb-3 pr-2">File</th>
                    <th className="pb-3 text-center">Verdict</th>
                    <th className="pb-3 text-center">Confidence</th>
                    <th className="pb-3 text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/30">
                  {stats.recent_activity.slice(0, 4).map((scan) => {
                    const isFake = scan.prediction === "AI Generated Voice";
                    return (
                      <tr key={scan.id} className="hover:bg-cyber-cardlight/20">
                        <td className="py-3 pr-2 font-medium truncate max-w-[120px]" title={scan.filename}>
                          {scan.filename}
                        </td>
                        <td className="py-3 text-center font-bold">
                          <span className={isFake ? 'text-cyber-danger' : 'text-cyber-success'}>
                            {isFake ? 'DEEPFAKE' : 'HUMAN'}
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold">{scan.confidence}%</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            scan.risk_level === 'HIGH' ? 'bg-cyber-danger/20 text-cyber-danger' :
                            scan.risk_level === 'MEDIUM' ? 'bg-cyber-warning/20 text-cyber-warning' :
                            'bg-cyber-success/20 text-cyber-success'
                          }`}>
                            {scan.risk_level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <p className="text-xs text-cyber-muted">No telemetry logs found.</p>
                <Link to="/upload" className="text-cyber-accent text-xs font-semibold hover:underline mt-1">
                  Upload file to generate telemetry
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
