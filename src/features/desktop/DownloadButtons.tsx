import { useState, useEffect } from 'react';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { releasesService, type ReleaseManifest } from '../../services/releases';


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


export function DownloadButtons() {
  const [os, setOs] = useState<OS>('Unknown');
  const [manifest, setManifest] = useState<ReleaseManifest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setOs(getOS());
  }, []);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Get platform-specific manifest based on detected OS
        const platform = os === 'Windows' ? 'windows' : os === 'macOS' ? 'macos' : undefined;
        const latestManifest = await releasesService.getLatestRelease(platform);
        setManifest(latestManifest);
      } catch (err) {
        setError('Failed to load release information');
        console.error('Error fetching release:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRelease();
  }, [os]);

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
    if (!manifest) return null;

    if (os === 'macOS') {
      const downloadUrl = releasesService.getDownloadUrlForPlatform(manifest, 'macos');
      const fileKey = 'macos_universal_dmg';
      const fileInfo = manifest.files[fileKey];

      return downloadUrl && fileInfo ? {
        url: downloadUrl,
        filename: fileInfo.filename,
        size: releasesService.formatFileSize(fileInfo.size),
        arch: fileInfo.arch,
        platform: 'macOS'
      } : null;
    }

    if (os === 'Windows') {
      // Try MSI first, then EXE
      let downloadUrl = releasesService.getDownloadUrlForPlatform(manifest, 'windows', 'x64', 'msi');
      let fileKey = 'windows_x64_msi';
      let fileType = 'MSI';

      if (!downloadUrl) {
        downloadUrl = releasesService.getDownloadUrlForPlatform(manifest, 'windows', 'x64', 'exe');
        fileKey = 'windows_x64_exe';
        fileType = 'EXE';
      }

      const fileInfo = manifest.files[fileKey];

      return downloadUrl && fileInfo ? {
        url: downloadUrl,
        filename: fileInfo.filename,
        size: releasesService.formatFileSize(fileInfo.size),
        arch: 'x64',
        platform: 'Windows',
        fileType
      } : null;
    }

    return null;
  };

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

  // Desktop platforms - Linux coming soon
  if (os === 'Linux') {
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-amber-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span className="font-medium">Linux support coming soon</span>
        </div>
      </div>
    );
  }

  // No download available
  if (!downloadInfo) {
    const platformName = os === 'macOS' ? 'macOS' : os === 'Windows' ? 'Windows' : 'this platform';
    return (
      <div className="space-y-4">
        <div className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-amber-500/20 text-[#94A3B8] rounded-full cursor-not-allowed">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span className="font-medium">No release available for {platformName} yet, but soon</span>
        </div>
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
              <span className="font-medium">
                Download for {downloadInfo.platform}
                {downloadInfo.platform === 'Windows' && (downloadInfo as any).fileType ? ` (${(downloadInfo as any).fileType})` : ''}
              </span>
              <span className="text-xs text-[#94A3B8]">v{manifest.version} • {downloadInfo.size}</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
