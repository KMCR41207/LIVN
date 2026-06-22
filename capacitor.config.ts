import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gousamhitha.app',
  appName: 'Gousamhitha',
  webDir: 'dist',
  bundledWebRuntime: false,
  // NO server.url — loads local dist files inside WebView
};

export default config;
