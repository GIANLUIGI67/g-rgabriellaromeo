import type { CapacitorConfig } from '@capacitor/cli';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local', override: true });
loadEnv();

const fallbackUrl = 'http://localhost:3000';
const appUrl = process.env.CAPACITOR_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl;
const normalizedUrl = new URL(appUrl);

const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || 'com.grgabriellaromeo.app',
  appName: process.env.CAPACITOR_APP_NAME || 'G-R Gabriella Romeo',
  webDir: 'mobile-shell',
  server: {
    url: appUrl,
    cleartext: normalizedUrl.protocol === 'http:',
    allowNavigation: [normalizedUrl.hostname],
  },
  ios: {
    path: 'ios app',
  },
  android: {
    path: 'android app',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
  },
};

export default config;
