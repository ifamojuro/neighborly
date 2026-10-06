import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.neighborly.app',
  appName: 'Neighborly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
