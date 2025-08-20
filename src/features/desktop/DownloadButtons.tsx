import React, { useState, useEffect } from 'react';
import { Download, Rocket } from 'lucide-react';

const MOCK_DOWNLOAD_URL = 'https://github.com/clones-ai/clones-desktop/actions/runs/16862612118/artifacts/3729147013';
const DEEPLINK_SCHEME = import.meta.env.VITE_DESKTOP_SCHEME || 'clones-dev';
const DOWNLOAD_DURATION_MS = 3000; // Simulate a 3-second download

type OS = 'Windows' | 'macOS' | 'Linux' | 'Unknown';

function getOS(): OS {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "macOS";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  return "Unknown";
}

interface DownloadButtonsProps {
  referralCode?: string;
}

export function DownloadButtons({ referralCode }: DownloadButtonsProps) {
  const [os, setOs] = useState<OS>('Unknown');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setOs(getOS());
  }, []);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 100 / (DOWNLOAD_DURATION_MS / 100);
        if (next >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          window.location.href = MOCK_DOWNLOAD_URL;
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const deepLink = `${DEEPLINK_SCHEME}://onboard?ref=${referralCode}`;
  const osName = (os === 'Unknown' || os === 'Linux') ? 'Desktop' : os;

  if (os === 'Linux') {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-red-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <span className="relative font-medium">Linux is not yet supported</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <a
        href={MOCK_DOWNLOAD_URL}
        onClick={handleDownload}
        className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 overflow-hidden"
      >
        {/* Progress Bar */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#3B82F6]/20 transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {isDownloading ? (
          <>
            <span className="relative font-medium z-10">Downloading... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <Download className="relative w-5 h-5 z-10" />
            <span className="relative font-medium z-10">Download for {osName}</span>
          </>
        )}
      </a>

      <a
        href={deepLink}
        className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-white/10 hover:border-white/30 text-[#94A3B8] rounded-full transition-all duration-300 hover:text-white"
      >
        <Rocket className="relative w-5 h-5" />
        <span className="relative font-medium">Open Existing App</span>
      </a>
    </div>
  );
}
