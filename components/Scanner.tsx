import React, { useRef, useState, useEffect } from 'react';
import { CameraIcon, UploadIcon, XIcon, RefreshIcon } from './Icons';

interface ScannerProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // Auto Scan State - Default to TRUE now
  const [isAutoScan, setIsAutoScan] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera. Izinkan akses atau gunakan unggah foto.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Auto Scan Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Only start countdown if stream is active and no error
    if (isAutoScan && !error && stream) {
      // Set countdown visual
      let timer = 3; // 3 seconds countdown
      setCountdown(timer);

      interval = setInterval(() => {
        timer--;
        setCountdown(timer);
        
        if (timer <= 0) {
          takePhoto();
          setIsAutoScan(false); // Stop auto scan after capture
          setCountdown(null);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      setCountdown(null);
    }

    return () => clearInterval(interval);
  }, [isAutoScan, error, stream]); // Added stream dependency to ensure it doesn't start before camera is ready

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between py-6">
      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 text-white relative z-20">
        <button onClick={onCancel} className="p-2 bg-gray-800 rounded-full bg-opacity-50 backdrop-blur">
          <XIcon className="w-6 h-6" />
        </button>
        
        {/* Auto Scan Toggle */}
        <button 
          onClick={() => setIsAutoScan(!isAutoScan)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isAutoScan ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-gray-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAutoScan ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
          {isAutoScan ? 'Otomatis' : 'Manual'}
        </button>

        <button onClick={switchCamera} className="p-2 bg-gray-800 rounded-full bg-opacity-50 backdrop-blur">
          <RefreshIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Video Viewport */}
      <div className="relative w-full aspect-[3/4] max-w-md my-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
         {/* Scanning Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none border-[1px] border-green-400/30">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>

        {/* Info Text */}
        <div className="absolute top-4 left-0 right-0 z-20 text-center">
            <span className="bg-black/40 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                {isAutoScan ? 'Tahan posisi kamera...' : 'Ketuk tombol untuk foto'}
            </span>
        </div>

        {/* Countdown Overlay for Auto Scan */}
        {countdown !== null && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <span className="text-8xl font-black text-white drop-shadow-lg animate-ping">{countdown}</span>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex justify-around items-center px-8 max-w-lg relative z-20">
        
        {/* File Upload Alternative */}
        <label className="flex flex-col items-center gap-1 text-white text-xs opacity-80 cursor-pointer hover:opacity-100 transition">
          <div className="p-3 bg-gray-800 rounded-full">
            <UploadIcon className="w-6 h-6" />
          </div>
          Unggah
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>

        {/* Capture Button */}
        <button 
          onClick={takePhoto}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center active:scale-95 transition-all ${
            isAutoScan 
              ? 'border-green-500 bg-green-500/20 scale-90' 
              : 'border-white bg-transparent'
          }`}
        >
          <div className={`w-16 h-16 rounded-full transition-colors ${
            isAutoScan ? 'bg-green-500 animate-pulse' : 'bg-white'
          }`}></div>
        </button>

         {/* Placeholder for symmetry */}
         <div className="w-12 opacity-0"></div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};