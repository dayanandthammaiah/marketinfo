import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daya.investment',
  appName: 'MarketPulse',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
