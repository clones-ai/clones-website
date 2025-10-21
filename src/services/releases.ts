interface ReleaseFile {
  filename: string;
  url: string;
  size: number;
  arch: string;
  type: 'dmg' | 'app' | 'msi' | 'exe';
}

interface ReleaseManifest {
  version: string;
  uploadDate: string;
  files: Record<string, ReleaseFile>;
}

const TIGRIS_BASE_URL = import.meta.env.DEV
  ? '/tigris'  // Use proxy in development
  : 'https://clones-desktop-release-prod.t3.storage.dev';  // Custom domain configured

class ReleasesService {
  private cache: Map<string, { data: ReleaseManifest; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getLatestRelease(platform?: 'macos' | 'windows'): Promise<ReleaseManifest | null> {
    const platformPath = platform === 'windows' ? '/windows' : '/darwin';
    const cacheKey = `latest${platformPath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${TIGRIS_BASE_URL}/latest${platformPath}/version.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifest: ReleaseManifest = await response.json();

      this.cache.set(cacheKey, {
        data: manifest,
        timestamp: Date.now()
      });

      return manifest;
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      return null;
    }
  }

  async getSpecificRelease(version: string, platform?: 'macos' | 'windows'): Promise<ReleaseManifest | null> {
    const platformPath = platform === 'windows' ? '/windows' : '/darwin';
    const cacheKey = `version-${version}${platformPath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${TIGRIS_BASE_URL}/versions/${version}${platformPath}/version.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifest: ReleaseManifest = await response.json();

      this.cache.set(cacheKey, {
        data: manifest,
        timestamp: Date.now()
      });

      return manifest;
    } catch (error) {
      console.error(`Failed to fetch release ${version}:`, error);
      return null;
    }
  }

  getDownloadUrlForPlatform(manifest: ReleaseManifest, platform: 'macos' | 'windows' | 'linux', arch?: 'x64', fileType?: 'dmg' | 'msi' | 'exe'): string | null {
    if (platform === 'linux') {
      // Linux not supported yet
      return null;
    }

    if (platform === 'macos') {
      // macOS only has universal binary now
      const key = 'macos_universal_dmg';
      const file = manifest.files[key];
      return file?.url || null;
    }

    if (platform === 'windows') {
      // Windows uses x64 architecture
      const windowsArch = arch || 'x64';
      const windowsFileType = fileType || 'msi';
      const key = `windows_${windowsArch}_${windowsFileType}`;
      const file = manifest.files[key];
      return file?.url || null;
    }

    return null;
  }

  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }

  isVersionNewer(version1: string, version2: string): boolean {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return true;
      if (v1Part < v2Part) return false;
    }

    return false;
  }
}

export const releasesService = new ReleasesService();
export type { ReleaseManifest, ReleaseFile };