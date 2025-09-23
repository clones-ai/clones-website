import { useState, useEffect } from 'react';
import { Download, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { releasesService, type ReleaseManifest } from '../../services/releases';

// Type definitions for User-Agent Client Hints API
interface NavigatorUAData {
  getHighEntropyValues(hints: string[]): Promise<{
    architecture?: string;
    bitness?: string;
    brands?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
    platform?: string;
  }>;
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData;
  }
}

const DEEPLINK_SCHEME = import.meta.env.VITE_DESKTOP_SCHEME || 'clones-dev';

type OS = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

function getOS(): OS {
  const userAgent = window.navigator.userAgent;
  
  // Mobile detection first
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  
  // Desktop detection
  if (userAgent.indexOf("Win") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "macOS";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  
  return "Unknown";
}

async function getArchitecture(): Promise<'arm64' | 'intel'> {
  // 1. Modern approach: User-Agent Client Hints (Chrome/Edge only)
  if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      if (hints.architecture === 'arm') {
        return 'arm64';
      }
      if (hints.architecture === 'x86') {
        return 'intel';
      }
    } catch {
      // Client Hints failed, continue to fallback
    }
  }

  // 2. Legacy detection for other browsers
  const userAgent = window.navigator.userAgent;

  // Explicit architecture in UA (rare but possible)
  if (userAgent.includes('ARM') || userAgent.includes('arm64')) {
    return 'arm64';
  }
  if (userAgent.includes('Intel') || userAgent.includes('x86_64') || userAgent.includes('WOW64')) {
    return 'intel';
  }

  // 3. For macOS: Default to ARM64 (most modern Macs)
  // User can manually override if wrong
  if (userAgent.includes('Mac')) {
    return 'arm64';  // Statistical best guess for 2025
  }

  return 'intel';
}

interface DownloadButtonsProps {
  referralCode?: string;
}

export function DownloadButtons({ referralCode }: DownloadButtonsProps) {
  const [os, setOs] = useState<OS>('Unknown');
  const [arch, setArch] = useState<'arm64' | 'intel'>('arm64');
  const [manifest, setManifest] = useState<ReleaseManifest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setOs(getOS());

    // Async architecture detection
    getArchitecture().then(detectedArch => {
      setArch(detectedArch);
    }).catch(() => {
      // Fallback to ARM64 on error (most common on modern Macs)
      setArch('arm64');
    });
  }, []);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const latestManifest = await releasesService.getLatestRelease();
        setManifest(latestManifest);
      } catch (err) {
        setError('Failed to load release information');
        console.error('Error fetching release:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  const handleDownload = (downloadUrl: string) => {
    if (isDownloading) return;

    setIsDownloading(true);

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset download state after a short delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const getDownloadInfo = () => {
    if (!manifest || os !== 'macOS') return null;

    const downloadUrl = releasesService.getDownloadUrlForPlatform(manifest, 'macos', arch, 'dmg');
    const fileKey = `macos_${arch}_dmg`;
    const fileInfo = manifest.files[fileKey];

    return downloadUrl && fileInfo ? {
      url: downloadUrl,
      filename: fileInfo.filename,
      size: releasesService.formatFileSize(fileInfo.size),
      arch: fileInfo.arch
    } : null;
  };

  const deepLink = `${DEEPLINK_SCHEME}://onboard?ref=${referralCode}`;
  const downloadInfo = getDownloadInfo();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 text-[#F8FAFC] rounded-full">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Loading release information...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !manifest) {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-red-500/20 text-[#94A3B8] rounded-full">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="font-medium">{error || 'Unable to load release information'}</span>
        </div>
      </div>
    );
  }

  // Mobile platforms
  if (os === 'iOS' || os === 'Android') {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-blue-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-center">Clones is only available on desktop computers</span>
        </div>
        <div className="text-center text-sm text-[#64748B]">
          Please visit this page from a macOS, Windows, or Linux computer to download the app.
        </div>
      </div>
    );
  }

  // Desktop platforms - Linux/Windows coming soon
  if (os === 'Linux' || os === 'Windows') {
    const platformName = os === 'Linux' ? 'Linux' : 'Windows';
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-amber-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span className="font-medium">{platformName} support coming soon</span>
        </div>

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

  // macOS - No download available
  if (!downloadInfo) {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-amber-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span className="font-medium">No release available for your architecture</span>
        </div>

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

  return (
    <div className="space-y-4">
      <button
        onClick={() => handleDownload(downloadInfo.url)}
        disabled={isDownloading}
        className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {isDownloading ? (
          <>
            <Loader2 className="relative w-5 h-5 z-10 animate-spin" />
            <span className="relative font-medium z-10">Starting download...</span>
          </>
        ) : (
          <>
            <Download className="relative w-5 h-5 z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="font-medium">Download for macOS ({downloadInfo.arch})</span>
              <span className="text-xs text-[#94A3B8]">v{manifest.version} • {downloadInfo.size}</span>
            </div>
          </>
        )}
      </button>

      {/* Architecture selector */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
        <span>Wrong architecture?</span>
        <div className="flex gap-1">
          <button
            onClick={() => setArch('arm64')}
            className={`px-2 py-1 rounded ${arch === 'arm64' ? 'bg-primary-500/20 text-primary-400' : 'hover:text-[#F8FAFC]'} transition-colors`}
          >
            Apple Silicon
          </button>

          <button
            onClick={() => setArch('intel')}
            className={`px-2 py-1 rounded ${arch === 'intel' ? 'bg-primary-500/20 text-primary-400' : 'hover:text-[#F8FAFC]'} transition-colors`}
          >
            Intel
          </button>
        </div>
      </div>

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
