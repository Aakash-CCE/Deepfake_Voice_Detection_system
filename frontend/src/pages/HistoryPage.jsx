import React, { useState, useEffect } from 'react';
import { scanService } from '../services/api';
import { History, Search, Filter, AlertTriangle, Calendar, FileText, ArrowRight, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  
  // Detail Drawer state
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await scanService.getHistory();
      setHistory(data);
    } catch (err) {
      setError('Could not retrieve audit logs. Make sure you are authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter logic
  const filteredHistory = history.filter((scan) => {
    const matchesSearch = scan.filename.toLowerCase().includes(search.toLowerCase());
    
    const matchesPrediction = 
      predictionFilter === 'All' ||
      (predictionFilter === 'Real' && scan.prediction === 'Real Human Voice') ||
      (predictionFilter === 'Fake' && scan.prediction === 'AI Generated Voice');
      
    const matchesRisk = 
      riskFilter === 'All' || 
      scan.risk_level === riskFilter;

    return matchesSearch && matchesPrediction && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Audit History</h1>
          <p className="text-sm text-cyber-muted">Inspect historic audiometric scan signatures and threat matches.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 border border-cyber-border hover:bg-cyber-cardlight text-xs font-semibold rounded-lg transition-colors"
        >
          Refresh Logs
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 glass p-4 rounded-xl border border-cyber-border">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyber-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cyber-card border border-cyber-border rounded-lg text-xs text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none"
          />
        </div>

        {/* Prediction Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyber-muted">
            <Filter className="w-3.5 h-3.5" />
          </span>
          <select
            value={predictionFilter}
            onChange={(e) => setPredictionFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cyber-card border border-cyber-border rounded-lg text-xs text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Results</option>
            <option value="Real">Real Voices Only</option>
            <option value="Fake">Deepfakes Only</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyber-muted">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cyber-card border border-cyber-border rounded-lg text-xs text-white placeholder-cyber-muted focus:border-cyber-accent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 glass border border-cyber-border rounded-xl">
          <Loader2 className="w-10 h-10 text-cyber-accent animate-spin mb-4" />
          <p className="text-xs text-cyber-muted">Retrieving audit database records...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg flex items-center gap-3 text-cyber-danger text-xs font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center p-20 glass border border-cyber-border rounded-xl">
          <FileText className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-bold text-sm text-white">No scans found</h3>
          <p className="text-xs text-cyber-muted mt-1">Adjust filters or run a threat scan first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Table */}
          <div className={`glass rounded-xl border border-cyber-border overflow-hidden ${selectedScan ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-cyber-cardlight/50 border-b border-cyber-border text-cyber-muted font-bold uppercase tracking-wider">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Filename</th>
                    <th className="p-4 text-center">Prediction</th>
                    <th className="p-4 text-center">Confidence</th>
                    <th className="p-4 text-center">Risk</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/40">
                  {filteredHistory.map((scan) => {
                    const isFake = scan.prediction === "AI Generated Voice";
                    const isSelected = selectedScan?.id === scan.id;
                    return (
                      <tr 
                        key={scan.id}
                        className={`hover:bg-cyber-cardlight/30 transition-colors ${isSelected ? 'bg-cyber-accent/5' : ''}`}
                      >
                        <td className="p-4 font-mono text-cyber-muted whitespace-nowrap">
                          {formatDate(scan.created_at)}
                        </td>
                        <td className="p-4 font-semibold truncate max-w-[150px]" title={scan.filename}>
                          {scan.filename}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold uppercase tracking-wide text-[9px] border ${
                            isFake 
                              ? 'bg-cyber-danger/10 text-cyber-danger border-cyber-danger/20' 
                              : 'bg-cyber-success/10 text-cyber-success border-cyber-success/20'
                          }`}>
                            {isFake ? <ShieldAlert className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                            {isFake ? 'DEEPFAKE' : 'HUMAN'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold font-mono">
                          {scan.confidence}%
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] ${
                            scan.risk_level === 'HIGH' ? 'bg-cyber-danger/20 text-cyber-danger' :
                            scan.risk_level === 'MEDIUM' ? 'bg-cyber-warning/20 text-cyber-warning' :
                            'bg-cyber-success/20 text-cyber-success'
                          }`}>
                            {scan.risk_level}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedScan(isSelected ? null : scan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyber-cardlight border border-cyber-border hover:border-cyber-accent text-cyber-accent hover:text-white rounded-md text-[10px] font-bold tracking-wide transition-all"
                          >
                            Diagnostics
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Side Panel Drawer */}
          {selectedScan && (
            <div className="glass p-6 rounded-xl border border-cyber-accent/30 shadow-glow-cyan/10 space-y-6">
              <div className="flex justify-between items-center border-b border-cyber-border pb-4">
                <div>
                  <h3 className="font-bold text-sm text-cyber-accent">Diagnostic Report</h3>
                  <p className="text-[10px] text-cyber-muted truncate max-w-[200px] font-mono mt-0.5">
                    {selectedScan.filename}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="text-cyber-muted hover:text-white text-xs font-semibold px-2 py-1 bg-cyber-cardlight border border-cyber-border rounded"
                >
                  Close
                </button>
              </div>

              {/* General Decision */}
              <div className={`p-4 rounded-lg border ${
                selectedScan.prediction === "AI Generated Voice" 
                  ? 'bg-cyber-danger/5 border-cyber-danger/20 text-cyber-danger' 
                  : 'bg-cyber-success/5 border-cyber-success/20 text-cyber-success'
              }`}>
                <p className="text-[10px] uppercase font-bold tracking-wider">Classification Verdict</p>
                <h4 className="text-base font-extrabold mt-1">{selectedScan.prediction}</h4>
                <div className="flex justify-between items-center text-xs mt-3 text-white">
                  <span>Confidence Level: <strong>{selectedScan.confidence}%</strong></span>
                  <span className="uppercase text-[10px] font-extrabold bg-current/10 px-2 py-0.5 rounded">
                    {selectedScan.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* Diagnostic Parameters */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase font-bold text-cyber-muted tracking-wider border-b border-cyber-border/40 pb-1">
                  Acoustic Features Log
                </h5>
                
                <div className="space-y-3 font-mono text-[11px]">
                  {/* Jitter */}
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-cyber-muted">Jitter (Local):</span>
                    <span className="text-white font-bold">{((selectedScan.jitter || 0) * 100).toFixed(3)}%</span>
                  </div>
                  {/* Shimmer */}
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-cyber-muted">Shimmer (Local):</span>
                    <span className="text-white font-bold">{((selectedScan.shimmer || 0) * 100).toFixed(3)}%</span>
                  </div>
                  {/* Pitch Mean */}
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-cyber-muted">Average Pitch (F0):</span>
                    <span className="text-white font-bold">{(selectedScan.pitch_mean || 0).toFixed(1)} Hz</span>
                  </div>
                  {/* Pitch Std */}
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-cyber-muted">Pitch Variation:</span>
                    <span className="text-white font-bold">{(selectedScan.pitch_std || 0).toFixed(1)} Hz</span>
                  </div>
                  {/* Spectral Centroid */}
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-cyber-muted">Spectral Centroid:</span>
                    <span className="text-white font-bold">{(selectedScan.spec_centroid || 0).toFixed(0)} Hz</span>
                  </div>
                  {/* ZCR */}
                  <div className="flex justify-between pb-1">
                    <span className="text-cyber-muted">Zero Crossing Rate:</span>
                    <span className="text-white font-bold">{(selectedScan.zcr || 0).toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
