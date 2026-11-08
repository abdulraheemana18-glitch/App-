export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'ai.superintelligence.app',
  appName: 'SUPER INTELLIGENCE AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#030712',
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030712',
    },
  },
};

export default config;
