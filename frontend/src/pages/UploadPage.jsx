import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileAudio, AlertTriangle, Play, ShieldAlert } from 'lucide-react';
import { scanService } from '../services/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const allowedExtensions = ['.wav', '.mp3', '.flac'];
    const filename = selectedFile.name;
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setError(`Invalid file format "${extension}". VocalShield supports only WAV, MP3, or FLAC.`);
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB maximum safety limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsScanning(true);
    setError('');

    // High-tech status display simulation alongside API call
    const statusSteps = [
      'Ingesting audio signal stream...',
      'Normalizing volume levels & resampling to 16kHz...',
      'Applying spectral subtraction noise gate...',
      'Extracting Mel-Frequency Cepstral Coefficients (MFCC)...',
      'Computing Chroma pitch vectors & spectral centroids...',
      'Analyzing local Pitch period stability (Jitter / Shimmer)...',
      'Executing ensemble Random Forest, SVM, and XGBoost models...',
      'Synthesizing diagnostic vulnerability report...'
    ];

    let currentStep = 0;
    setStatusText(statusSteps[0]);

    const statusInterval = setInterval(() => {
      if (currentStep < statusSteps.length - 1) {
        currentStep++;
        setStatusText(statusSteps[currentStep]);
      }
    }, 800);

    try {
      const result = await scanService.predict(file);
      clearInterval(statusInterval);
      
      // Navigate to results screen, passing prediction data in state
      navigate('/result', { state: { result, filename: file.name } });
    } catch (err) {
      clearInterval(statusInterval);
      setError(err.response?.data?.detail || 'Analytic engine scan failed. Audio might be too short or corrupted.');
      setIsScanning(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide">Threat Scanner</h1>
        <p className="text-sm text-cyber-muted">Upload and analyze voice prints to verify biological authenticity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Terminal */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-cyber-border">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-cyber-accent">
              Audiometric Dropzone
            </h2>

            {/* Drop Zone Box */}
            {!isScanning && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={file ? null : triggerFileInput}
                className={`relative border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-cyber-accent bg-cyber-accent/5'
                    : file
                    ? 'border-cyber-border bg-cyber-card/30 cursor-default'
                    : 'border-cyber-border hover:border-cyber-accent/50 hover:bg-cyber-card/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".wav,.mp3,.flac"
                  className="hidden"
                />

                {file ? (
                  <div className="w-full flex flex-col items-center">
                    <FileAudio className="w-16 h-16 text-cyber-accent shadow-glow-cyan mb-4" />
                    <p className="font-semibold text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-cyber-muted mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={handleAnalyze}
                        className="flex items-center gap-2 px-6 py-2.5 bg-cyber-accent text-cyber-card font-bold rounded-lg text-sm transition-all hover:bg-sky-300 hover:shadow-glow-cyan active:translate-y-[1px]"
                      >
                        <Play className="w-4 h-4 fill-cyber-card" />
                        Execute Scan
                      </button>
                      <button
                        onClick={removeFile}
                        className="px-6 py-2.5 border border-cyber-border hover:bg-cyber-cardlight hover:text-cyber-danger rounded-lg text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-cyber-cardlight rounded-full border border-cyber-border mb-4 text-cyber-muted">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-sm">Drag and drop audio file here</p>
                    <p className="text-xs text-cyber-muted mt-1">WAV, MP3, or FLAC (Max 10MB)</p>
                    <button
                      onClick={triggerFileInput}
                      className="mt-6 px-4 py-2 border border-cyber-accent text-cyber-accent text-xs font-bold rounded-md hover:bg-cyber-accent hover:text-cyber-card shadow-glow-cyan/20 transition-all duration-300"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SCANNING STATE (Radar sweep animation) */}
            {isScanning && (
              <div className="flex flex-col items-center justify-center p-12 relative overflow-hidden bg-cyber-card/30 border border-cyber-border rounded-lg">
                {/* Radar Grid Graphic */}
                <div className="relative w-44 h-44 rounded-full border border-cyber-accent/20 flex items-center justify-center mb-6">
                  {/* Concentric circles */}
                  <div className="absolute w-32 h-32 rounded-full border border-cyber-accent/15"></div>
                  <div className="absolute w-20 h-20 rounded-full border border-cyber-accent/10"></div>
                  <div className="absolute w-8 h-8 rounded-full border border-cyber-accent/20 bg-cyber-accent/5"></div>
                  
                  {/* Radar sweep hand */}
                  <div className="absolute top-0 left-0 w-full h-full radar-sweep pointer-events-none">
                    <div className="w-1/2 h-1/2 border-r border-cyber-accent/40 bg-gradient-to-tr from-transparent to-cyber-accent/25 rounded-tr-full"></div>
                  </div>
                </div>

                <h3 className="font-bold text-base text-cyber-accent animate-pulse">Scanning Bio-metrics...</h3>
                <p className="text-xs text-cyber-muted mt-2 font-mono h-4">{statusText}</p>
                <div className="w-64 bg-cyber-card border border-cyber-border h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-cyber-accent h-full animate-[scan_3s_infinite_linear] rounded-full w-1/3"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg flex items-start gap-3 text-cyber-danger text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Warnings / Instructions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border border-cyber-border space-y-4">
            <h3 className="font-bold text-sm text-cyber-danger flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Security Protocols
            </h3>
            <ul className="text-xs space-y-3 list-disc pl-4 text-cyber-muted">
              <li>All loaded voice prints are processed entirely in secure memory and deleted instantly after diagnostic classification.</li>
              <li>Maximum file sizes are capped at 10 MB to prevent resource exhaustion attacks.</li>
              <li>For ideal results, use voice recordings with minimal ambient reverb and background noise.</li>
              <li>Recordings must be at least 0.5 seconds long to perform stable pitch-period tracking.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
